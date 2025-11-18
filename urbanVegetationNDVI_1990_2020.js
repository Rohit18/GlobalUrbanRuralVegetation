// 1. COUNTRY POLYGONS
var countries = ee.FeatureCollection(
  "projects/sat-io/open-datasets/geoboundaries/CGAZ_ADM0"
);

// 2. ESA CCI PRODUCTS (for built-up masks)
var esacci = ee.Image("users/tirthankar25/ESA_CCI_1992_2020");
var esacci1995 = ee.Image("users/tirthankar25/ESA_CCI_1995");

// 3. MAP YEARS TO ESA CCI BANDS FOR BUILT-UP = 190
var yearConfigs = {
  '1990': esacci.select('b1'),
  '1995': esacci1995.select('b1'),
  '2000': esacci.select('b9'),
  '2005': esacci.select('b14'),
  '2010': esacci.select('b19'),
  '2015': esacci.select('b24'),
  '2020': esacci.select('b29')
};
var years = Object.keys(yearConfigs);

// 4. FUNCTION TO GET ANNUAL NDVI MOSAIC
function getAnnualNDVI(year) {
  var start = year + '-01-01';
  var end =   year + '-12-31';
  var col = ee.ImageCollection('LANDSAT/COMPOSITES/C02/T1_L2_ANNUAL_NDVI')
              .filterDate(start, end);
  return col.mosaic().select('NDVI');
}

// 5. LOOP OVER YEARS, ZONAL REDUCTION & EXPORT
years.forEach(function(year) {
  // 5a. Build built-up mask
  var builtUpMask = yearConfigs[year]
                      .eq(190)
                      .selfMask();
  
  // 5b. Load & mask NDVI
  var ndviImage = getAnnualNDVI(year);
  var urbanNdvi = ndviImage.updateMask(builtUpMask);
  
  // 5c. Zonal mean NDVI per country
  var stats = urbanNdvi
    .rename('meanNDVI')
    .reduceRegions({
      collection: countries,
      reducer: ee.Reducer.mean(),
      scale: 30,
      tileScale: 8
    })
    .map(function(feat) {
      return feat.set('year', year);
    });
  
  // 5d. Export to Drive
  Export.table.toDrive({
    collection: stats,
    description: 'urbanNDVI_' + year + '_export',
    folder: 'UrbanVegetation',
    fileFormat: 'CSV'
  });
});
