// Load country boundaries from GeoBoundaries
var countries = ee.FeatureCollection("projects/sat-io/open-datasets/geoboundaries/CGAZ_ADM0");

// Load ESA CCI products
// ESACCI product covering 1992 to 2020 is used for most built‐up masks and land cover
var esacci = ee.Image("users/tirthankar25/ESA_CCI_1992_2020");
// Separate ESACCI asset for 1995 (assumed available) for built‐up mask in 1995
var esacci1995 = ee.Image("users/tirthankar25/ESA_CCI_1995");

// Define GLC images for each target year
// 1990: Use ESACCI 1992 for GLC (select band b1)
var glc1990 = esacci.select("b1");

// 1995: Use the 5-year mosaic (assumed to represent ESACCI 1995) and select band b2
var glc1995 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/five-years-map")
                .mosaic()
                .select('b2');

// 2000, 2005, 2010, 2015 from the annual collection (bands as defined by the product)
var glc2000 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/annual")
               .mosaic()
               .select("b1");
var glc2005 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/annual")
               .mosaic()
               .select("b6");
var glc2010 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/annual")
               .mosaic()
               .select("b11");
var glc2015 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/annual")
               .mosaic()
               .select("b16");

// 2020: Use the annual collection and select band b21
var glc2020 = ee.ImageCollection("projects/sat-io/open-datasets/GLC-FCS30D/annual")
               .mosaic()
               .select("b21");

// Create built-up masks from the ESA CCI products
// For 1990: from ESACCI 1992 (band b1)
var builtUp1990mask = esacci.select("b1").eq(190).selfMask();
// For 1995: from the separate ESACCI 1995 asset (assuming band b1 is used similarly)
var builtUp1995mask = esacci1995.select("b1").eq(190).selfMask();
// For 2000, 2005, 2010, 2015, 2020 as per original band mapping
var builtUp2000mask = esacci.select("b9").eq(190).selfMask();
var builtUp2005mask = esacci.select("b14").eq(190).selfMask();
var builtUp2010mask = esacci.select("b19").eq(190).selfMask();
var builtUp2015mask = esacci.select("b24").eq(190).selfMask();
var builtUp2020mask = esacci.select("b29").eq(190).selfMask();

// Define green vegetation classes
var greenVegClasses = [
  // Croplands
  10, 11, 12, 20,
  // Forests
  51, 52, 61, 62, 71, 72, 81, 82, 91, 92,
  // Shrubland
  120, 121, 122,
  // Grassland
  130,
  // Lichens/mosses
  140,
  // Sparse vegetation
  150, 152, 153,
  // Wetland with green emergent vegetation
  181, 182, 185, 186
];

// Function to create a binary mask for selected classes
function createClassMask(image, selectedCodes) {
  var remapped = image.remap({
    from: selectedCodes,
    to: selectedCodes.map(function() { return 1; }),
    defaultValue: 0
  });
  return remapped.eq(1).selfMask();
}

// Create vegetation masks for each year using the defined green vegetation classes
var vegMask1990 = createClassMask(glc1990, greenVegClasses);
var vegMask1995 = createClassMask(glc1995, greenVegClasses);
var vegMask2000 = createClassMask(glc2000, greenVegClasses);
var vegMask2005 = createClassMask(glc2005, greenVegClasses);
var vegMask2010 = createClassMask(glc2010, greenVegClasses);
var vegMask2015 = createClassMask(glc2015, greenVegClasses);
var vegMask2020 = createClassMask(glc2020, greenVegClasses);

// Function to compute the urban fraction for a target mask within urban areas
function computeUrbanFraction(urbanMask, targetMask, yearLabel) {
  // Compute built-up area (m²)
  var builtUpAreaImg = urbanMask.multiply(ee.Image.pixelArea())
                                .rename("builtUpArea_m2");

  // Compute target (vegetation) area within the urban mask (m²)
  var intersectionAreaImg = targetMask.updateMask(urbanMask)
                                      .multiply(ee.Image.pixelArea())
                                      .rename("targetInUrbanArea_m2");
  
  // Combine the images for simultaneous reduction
  var combined = ee.Image.cat(builtUpAreaImg, intersectionAreaImg);
  
  // Reduce over each country
  var stats = combined.reduceRegions({
    collection: countries,
    reducer: ee.Reducer.sum(),
    scale: 30
  });
  
  // Calculate the fraction while avoiding division by zero
  var results = stats.map(function(feat) {
    var builtUpA = ee.Number(feat.get("builtUpArea_m2"));
    var targetA = ee.Number(feat.get("targetInUrbanArea_m2"));
    var frac = ee.Algorithms.If(builtUpA.gt(0), targetA.divide(builtUpA), 0);
    return feat.set({
      'year': yearLabel,
      'fractionInUrban': frac
    });
  });
  
  return results;
}

// Compute urban fractions for vegetation for each year
var vegUrban1990 = computeUrbanFraction(builtUp1990mask, vegMask1990, 'veg_1990');
var vegUrban1995 = computeUrbanFraction(builtUp1995mask, vegMask1995, 'veg_1995');
var vegUrban2000 = computeUrbanFraction(builtUp2000mask, vegMask2000, 'veg_2000');
var vegUrban2005 = computeUrbanFraction(builtUp2005mask, vegMask2005, 'veg_2005');
var vegUrban2010 = computeUrbanFraction(builtUp2010mask, vegMask2010, 'veg_2010');
var vegUrban2015 = computeUrbanFraction(builtUp2015mask, vegMask2015, 'veg_2015');
var vegUrban2020 = computeUrbanFraction(builtUp2020mask, vegMask2020, 'veg_2020');

// Export the results to CSV files in Google Drive folder "UV"
Export.table.toDrive({
  collection: vegUrban1990,
  description: 'vegUrban1990_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban1995,
  description: 'vegUrban1995_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban2000,
  description: 'vegUrban2000_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban2005,
  description: 'vegUrban2005_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban2010,
  description: 'vegUrban2010_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban2015,
  description: 'vegUrban2015_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: vegUrban2020,
  description: 'vegUrban2020_export',
  folder: 'UV',
  fileFormat: 'CSV'
});
