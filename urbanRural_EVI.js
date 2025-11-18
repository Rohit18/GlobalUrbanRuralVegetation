/**************************************************************
 *  Mean annual EVI (2020) for every urban & rural cluster
 *  ----------------------------------------------------------
 *  – No masking (all EVI pixels considered)
 *  – No bestEffort  ➜  uses tileScale instead
 *  – Adds one numeric property:  meanEVI_2020
 *  – Exports two CSVs (rural & urban)
 **************************************************************/

/* ---------- 1. USER PARAMS ---------- */
var YEAR         = 2020;
var START        = ee.Date.fromYMD(YEAR, 1, 1);
var END          = START.advance(1, 'year');
var RURAL_FC_ID  = 'projects/ee-mukherjeerishi/assets/globalRural2018merged';
var URBAN_FC_ID  = 'projects/ee-mukherjeerishi/assets/globalUrban2018WithAreaIndex_above1km';

/* ---------- 2. LOAD DATA ---------- */
// The annual composite contains exactly **one** image per year → .first()
var evi2020 = ee.ImageCollection('LANDSAT/COMPOSITES/C02/T1_L2_ANNUAL_EVI')
                 .filterDate(START, END)
                 .first()                       // the 2020 composite
                 .select('EVI');                // keep only the EVI band

// Feature-collections
var ruralFC = ee.FeatureCollection(RURAL_FC_ID);
var urbanFC = ee.FeatureCollection(URBAN_FC_ID);

/* ---------- 3. MEAN-EVI HELPER ---------- */
var addMeanEVI = function(feature) {
  var meanVal = evi2020.reduceRegion({
      reducer:   ee.Reducer.mean(),
      geometry:  feature.geometry(),
      scale:     30,        // nominal Landsat resolution
      tileScale: 4,         // split computation tiles (avoids memory errors)
      maxPixels: 1e13
  }).getNumber('EVI');      // returns null if no pixels

  // Flag empty clusters with -9999 so they stay numeric
  var cleanVal = meanVal.unmask(-9999);
  return feature.set('meanEVI_2020', cleanVal);
};

/* ---------- 4. APPLY & INSPECT ---------- */
var ruralWithEVI = ruralFC.map(addMeanEVI);
var urbanWithEVI = urbanFC.map(addMeanEVI);

// Quick sanity check: property should be visible here 👇
print('First rural feature:', ruralWithEVI.first());
print('First urban feature:', urbanWithEVI.first());

/* ---------- 5. EXPORT ---------- */
Export.table.toDrive({
  collection: ruralWithEVI,
  description: 'rural_meanEVI_2020',
  fileFormat:  'CSV'
});

Export.table.toDrive({
  collection: urbanWithEVI,
  description: 'urban_meanEVI_2020',
  fileFormat:  'CSV'
});

/* ---------- 6. OPTIONAL LAYER FOR MAP ---------- */
// Map.addLayer(evi2020, {min:-0.1, max:0.8,
//                        palette:['d4f0ff','a8ddb5','4daf4a','006400']},
//             'EVI 2020');
