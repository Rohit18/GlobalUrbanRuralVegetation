/**************************************************************
 *  Mean annual NDVI (2020) for every urban & rural cluster
 *  ----------------------------------------------------------
 *  – No masking (all NDVI pixels considered)
 *  – No bestEffort  ➜  uses tileScale instead
 *  – Adds one numeric property:  meanNDVI_2020
 *  – Exports two CSVs (rural & urban)
 **************************************************************/

/* ---------- 1. USER PARAMS ---------- */
var YEAR         = 2020;
var START        = ee.Date.fromYMD(YEAR, 1, 1);
var END          = START.advance(1, 'year');
var RURAL_FC_ID  = 'projects/ee-mukherjeerishi/assets/globalRural2018merged';
var URBAN_FC_ID  = 'projects/ee-mukherjeerishi/assets/globalUrban2018WithAreaIndex_above1km';

/* ---------- 2. LOAD DATA ---------- */
// Annual Landsat NDVI composite: exactly one image per year
var ndvi2020 = ee.ImageCollection('LANDSAT/COMPOSITES/C02/T1_L2_ANNUAL_NDVI')
                 .filterDate(START, END)
                 .first()                       // the 2020 composite
                 .select('NDVI');               // keep only the NDVI band

// Feature-collections
var ruralFC = ee.FeatureCollection(RURAL_FC_ID);
var urbanFC = ee.FeatureCollection(URBAN_FC_ID);

/* ---------- 3. MEAN-NDVI HELPER ---------- */
var addMeanNDVI = function(feature) {
  var meanVal = ndvi2020.reduceRegion({
      reducer:   ee.Reducer.mean(),
      geometry:  feature.geometry(),
      scale:     30,        // nominal Landsat resolution
      tileScale: 4,         // avoids memory errors without bestEffort
      maxPixels: 1e13
  }).getNumber('NDVI');     // returns null if no pixels

  // Keep numeric column even when null (optional – comment out if not needed)
  var cleanVal = ee.Number(meanVal).unmask(-9999);

  return feature.set('meanNDVI_2020', cleanVal);
};

/* ---------- 4. APPLY & INSPECT ---------- */
var ruralWithNDVI = ruralFC.map(addMeanNDVI);
var urbanWithNDVI = urbanFC.map(addMeanNDVI);

// Quick sanity check: property should be visible here
print('First rural feature:', ruralWithNDVI.first());
print('First urban feature:', urbanWithNDVI.first());

/* ---------- 5. EXPORT ---------- */
Export.table.toDrive({
  collection: ruralWithNDVI,
  description: 'rural_meanNDVI_2020',
  fileFormat:  'CSV'
});

Export.table.toDrive({
  collection: urbanWithNDVI,
  description: 'urban_meanNDVI_2020',
  fileFormat:  'CSV'
});

/* ---------- 6. OPTIONAL LAYER FOR MAP ---------- */
// Map.addLayer(ndvi2020, {min:-0.1, max:0.8,
//                         palette:['d4f0ff','a8ddb5','4daf4a','006400']},
//              'NDVI 2020');
