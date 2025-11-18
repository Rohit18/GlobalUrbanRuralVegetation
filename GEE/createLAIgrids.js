// FeatureCollection of 30° grid polygons:
var gridFC = ee.FeatureCollection("projects/ee-mukherjeerishi/assets/grid_30egree_filteredbyLand");

var gridList = gridFC.toList(57);

var gridIndex = 0; 
var gridFeature = ee.Feature(gridList.get(gridIndex));
var gridRegion = gridFeature.geometry();

// Define date range and compute the middle date.
var startDate = '2020-01-01';
var endDate = '2021-01-01';
var difference = ee.Date(endDate).difference(ee.Date(startDate), 'day');
var middleDate = ee.Date(startDate).advance(difference.divide(2), 'day');
var middleDateString = middleDate.format('YYYY-MM-dd').getInfo();
var outputName = 'LAI_Grid_30deg_' + gridIndex + '_' + middleDateString;

// Define PFT names.
var landCovernames = ['CRO','SH','GRA','WSA','WET','ENF','EBF','DBF','MF'];

// Land cover types and corresponding FeatureCollections for training.
var landCoverTrainingData = {
  'CRO': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/CRO'),
  'SH' : ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/OSH'),
  'GRA': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/GRA'),
  'WSA': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/WSA'),
  'WET': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/WET'),
  'ENF': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/ENF'),
  'EBF': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/EBF'),
  'DBF': ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/DBF'),
  'MF' : ee.FeatureCollection('projects/ee-liangwanzju/assets/S2LAI_Trainingdata/MF')
};

// Define land cover types (vegetation targets) and their corresponding codes.
var landCoverTypes = {
  'GRA': [130],    // Grassland
  'EBF': [51, 52], // Evergreen Broadleaf Forest
  'DBF': [61, 62], // Deciduous Broadleaf Forest
  'MF' : [91, 92],  // Mixed Forest
  'SH' : [120,121,122],  // Shrubland
  'WSA': [150,152,153],   // Sparse vegetation
  'CRO': [10,11,12,20],    // Cropland
  'ENF': [71,72,81,82],    // Evergreen Needleleaf Forest
  'WET': [181,182,183,184,185,186,187]  // Wetland
};

// Only these PFTs will be divided by NIRV
var selectedTypesForNIRVDivision = {
    'GRA': [130],  'WSA': [150,152,153], 'SH': [120,121,122], 'ENF': [71,72,81,82], 'CRO': [10,11,12,20]
};


var NVTypes = {
  'TUD': [140],
  'IMP': [190],
  'BAL': [150,152,153,200,201,202],
  'WTR': [210],
  'PSI': [220]
};

// Define Sentinel-2 band names.
var featureNames = ['B1','B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12'];


/**
 * Cloud mask function using Sentinel-2 cloud probability.
 * This version checks that the cloud probability image exists before attempting to select its band.
 */
function maskS2clouds(image) {
  var cloudThreshold = 40;
  // Get the cloud probability image collection filtered by the same system:index.
  var cpCollection = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
                        .filter(ee.Filter.eq('system:index', image.get('system:index')));
  // Check if the collection has at least one image.
  var cpExists = cpCollection.size().gt(0);

  // Use ee.Algorithms.If to choose the proper processing branch.
  return ee.Algorithms.If(cpExists,
    // True case: cloud probability exists. Use it to build a cloud mask.
    (function() {
      var cp = ee.Image(cpCollection.first());
      var cloudMask = cp.select('probability').lt(cloudThreshold);
      return image.updateMask(cloudMask).multiply(0.0001);
    })(),
    // False case: no cloud probability image available. Return the image after scaling.
    image.multiply(0.0001)
  );
}


/**
 * Function to get Sentinel-2 and Landsat land cover images for a given region.
 * This function also includes a safety check for the Sentinel-2 median image.
 */
function getImagesAndLandCover(region, startDate, endDate, CRS) {
  // Filter Sentinel-2 collection by bounds, date, and cloud cover.
  var s2Col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(region)
                .filterDate(startDate, endDate)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 80));

  // Exclude known problematic scenes. (Commented out in original B)
  // s2Col = s2Col.filter(ee.Filter.neq('system:index', '20200216T033829_20200216T034731_T47QQF'));
  // s2Col = s2Col.filter(ee.Filter.neq('system:index', '20200216T033829_20200216T034731_T48PTA'));
  // s2Col = s2Col.filter(ee.Filter.neq('system:index', '20200216T033829_20200216T034731_T48QTJ'));
  // // s2Col = s2Col.filter(ee.Filter.neq('system:index', '20200216T033829_20200216T034731_T48QUJ'));

  // Filter out images that do not have all the required bands.
  featureNames.forEach(function(band) {
    s2Col = s2Col.filter(ee.Filter.listContains('system:band_names', band));
  });
  print('Number of Sentinel-2 images after filtering:', s2Col.size());

  // Apply the cloud mask and compute the median image.
  var s2Median = s2Col.map(maskS2clouds).median();
  print('s2Median (before dummy substitution):', s2Median);

  // Null check: if the median image is empty (i.e. it does not have any bands), substitute with a dummy image.
  var s2Image = ee.Image(ee.Algorithms.If(
    s2Median.bandNames().size().gt(0),
    s2Median,
    ee.Image.constant([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).rename(featureNames)
  ));
  print('s2Image after handling missing data:', s2Image);

  var s2ImageResampled = s2Image.select(featureNames)
                         .reproject({
                           crs: CRS,
                           scale: 10
                         })
                         .clip(region);
  print('s2Image after select and reproject:', s2ImageResampled);
  print('Band names after select:', s2ImageResampled.bandNames());

  // Process Landsat land cover image.
  var year = ee.Date(endDate).get('year').subtract(1999);
  var bandName = ee.String('b').cat(year.format());
  var landsatMosaic = ee.ImageCollection('projects/sat-io/open-datasets/GLC-FCS30D/annual').mosaic();
  print('Landsat mosaic:', landsatMosaic);

  var LandsatLc = landsatMosaic.select(bandName)
                              .reproject({
                                crs: CRS,
                                scale: 10
                              })
                              .clip(region);
  print('Landsat land cover image:', LandsatLc);
  print('Band names of LandsatLc:', LandsatLc.bandNames());

  return {s2Image: s2ImageResampled, LandsatLc: LandsatLc};
}


// Define CRS.
var CRS = 'EPSG:4326';

// Get the Sentinel-2 and Landsat land cover images for the specified grid.
var images = getImagesAndLandCover(gridRegion, startDate, endDate, CRS);
var s2Image = images.s2Image.select(featureNames);
var LandsatLc = images.LandsatLc;

// Debug: Check Sentinel-2 bands.
var s2BandsAfterSelect = s2Image.bandNames();
print('s2Image bands after select:', s2BandsAfterSelect);
if (s2BandsAfterSelect.size().eq(0)) {
  print('Warning: Sentinel-2 image for grid ' + gridIndex + ' is empty or missing expected bands.');
}

// Debug: Check Landsat bands.
var landsatBandsAfterSelect = LandsatLc.bandNames();
print('LandsatLc bands after select:', landsatBandsAfterSelect);
if (landsatBandsAfterSelect.size().eq(0)) {
  print('Warning: Landsat land cover image for grid ' + gridIndex + ' is empty or missing expected bands.');
}

// Calculate NIR (B8) and derive NIRV.
var NIR = s2Image.select('B8');
var RED = s2Image.select('B4');
var NIRV = NIR.subtract(RED).divide(NIR.add(RED)).multiply(NIR).rename('NIRV');
var s2ImageWithNIRV = s2Image.addBands(NIRV);
print('s2Image with NIRV added:', s2ImageWithNIRV);

// Create mask for selected vegetation types using Landsat land cover codes.
var divisionMaskForNIRV = ee.Image(0);
Object.keys(selectedTypesForNIRVDivision).forEach(function(key) {
  var mask = LandsatLc.remap(
    selectedTypesForNIRVDivision[key],
    ee.List.repeat(1, selectedTypesForNIRVDivision[key].length),
    0
  );
  divisionMaskForNIRV = divisionMaskForNIRV.add(mask);
});
print('Division mask for vegetation types:', divisionMaskForNIRV);

// Apply the mask to the Sentinel-2 image and perform the division by NIRV
var maskeds2Image1 = s2ImageWithNIRV.updateMask(divisionMaskForNIRV);
var maskeds2Image2 = maskeds2Image1.divide(maskeds2Image1.select('NIRV'));
var maskeds2Image3 = maskeds2Image2.unmask(s2ImageWithNIRV);
var maskeds2Image = maskeds2Image3.select(featureNames);
print('maskeds2Image (after selective NIRV division):', maskeds2Image);


// Inference: For each land cover type, train a model using available training data.
var result_ls = landCovernames.map(function(type) {
  var typeValues = landCoverTypes[type];
  var targetValues = ee.List.repeat(1, typeValues.length);
  var currentTypeMask = LandsatLc.remap(typeValues, targetValues, 0).gt(0);


  var currentTypeImage = maskeds2Image.updateMask(currentTypeMask);

  var trainingData = landCoverTrainingData[type].map(function(feature) {
    return feature.select(['LAI', 'B1','B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12'], null, false);
  });
  print('Training data for type', type, 'size:', trainingData.size());

  var classifier = ee.Classifier.smileRandomForest(25)
                        .setOutputMode('REGRESSION')
                        .train({
                          features: trainingData,
                          classProperty: 'LAI',
                          inputProperties: featureNames
                        });

  var prediction = currentTypeImage.classify(classifier, 'predicted_LAI');
  print('Prediction image for type', type, ':', prediction);
  return prediction;
});

// Combine predictions by taking the maximum predicted value per pixel.
var final1 = ee.ImageCollection(result_ls).reduce(ee.Reducer.max());
print('Combined prediction image:', final1);

// Create a LAI mask using Landsat land cover codes.
var LAIMask = ee.Image(0).byte().clip(LandsatLc.geometry());
Object.keys(landCoverTypes).forEach(function(type) {
  var codes = landCoverTypes[type];
  var mask = LandsatLc.remap(codes, ee.List.repeat(1, codes.length), 0);
  LAIMask = LAIMask.add(mask);
});
print('LAI mask:', LAIMask);

// Apply cloud mask from Sentinel-2 image.
var cloudmask = s2Image.select('B2').mask(); // Use the cloud mask from the original S2 image bands
var final = final1.updateMask(LAIMask).unmask(0).updateMask(cloudmask);
print('Final processed image:', final);

// Multiply LAI by 10 and convert to integer.
var finalInt = final.multiply(10).toInt();
print('Final image multiplied and converted to int:', finalInt);

// Export the final image to an asset with error handling.
try {
  Export.image.toAsset({
    image: finalInt,
    description: outputName,
    assetId: 'projects/tc-global-urban/assets/' + outputName + '_v2',
    scale: 10,
    region: gridRegion,
    crs: CRS,
    maxPixels: 1e13
  });
} catch (error) {
  print("Export error for grid " + gridIndex + ":", error);
}
