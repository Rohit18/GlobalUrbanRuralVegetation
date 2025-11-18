// 1) Load WorldCover and pixel-area (m²)
var worldCover = ee.ImageCollection('ESA/WorldCover/v100').first().select('Map');
var areaImage  = ee.Image.pixelArea();

// 2) Map ESA codes → human-readable names
var codeToName = ee.Dictionary({
  '10':  'tree',
  '20':  'shrub',
  '30':  'grass',
  '40':  'crop',
  '50':  'builtup',
  '60':  'bare',
  '70':  'snow',
  '80':  'water',
  '90':  'wetland',
  '95':  'mangrove',
  '100': 'moss'
});

// 2b) Define which codes count as “vegetation” vs “non-vegetation”
var vegCodes    = ee.List(['10','20','30','40','90','95','100']);
var nonVegCodes = ee.List(['50','60','70','80']);

// 3) Stack the two bands: [area, class]
var classAreaImage = areaImage.addBands(worldCover.rename('class'));

// 4) Load your urban & rural FeatureCollections
var urbanFC = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalUrban2018WithAreaIndex_above1km');
var ruralFC = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalRural2018merged');

// 5) Function to compute per-class, veg, non-veg & total areas
function computeAreas(feature) {
  var geom = feature.geometry();

  // 5a) Grouped sum: pixelArea by class code
  var grouped = classAreaImage.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName:  'class'
    }),
    geometry: geom,
    scale: 10,
    maxPixels: 1e13
  });

  // 5b) Turn that into a code→area dictionary
  var groups = ee.List(ee.Algorithms.If(grouped.get('groups'),
                                        grouped.get('groups'),
                                        []));
  var classAreaDict = ee.Dictionary(
    groups.iterate(function(item, acc) {
      item = ee.Dictionary(item);
      var code = ee.Number(item.get('class')).format();
      var sum  = ee.Number(item.get('sum'));
      return ee.Dictionary(acc).set(code, sum);
    }, ee.Dictionary({}))
  );

  // 5c) Compute total pixel-area for the feature
  var totalArea = ee.Number(
    areaImage
      .reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geom,
        scale: 10,
        maxPixels: 1e13
      })
      .get('area', 0)    // default to zero
  );

  // 5d) Sum up vegetation vs non-vegetation directly from the dict
  var vegArea = ee.Number(
    vegCodes.iterate(function(code, sum) {
      return ee.Number(sum)
               .add(ee.Number(classAreaDict.get(code, 0)));
    }, 0)
  );
  var nonVegArea = ee.Number(
    nonVegCodes.iterate(function(code, sum) {
      return ee.Number(sum)
               .add(ee.Number(classAreaDict.get(code, 0)));
    }, 0)
  );

  // 5e) Start with the original feature, then set:
  //     • area_<classname> for each class  
  //     • total_vegetation_area_m2  
  //     • total_nonvegetation_area_m2  
  //     • total_area_m2
  var out = ee.Feature(
    codeToName.keys().iterate(function(code, feat) {
      code = ee.String(code);
      var name  = ee.String(codeToName.get(code));
      var key   = ee.String(name);
      var value = ee.Number(classAreaDict.get(code, 0));
      return ee.Feature(feat).set(key, value);
    }, feature)
  )
  .set('total_vegetation_area_m2',    vegArea)
  .set('total_nonvegetation_area_m2', nonVegArea)
  .set('total_area_m2',               totalArea);

  return out;
}

// 6) Apply to both collections
var urbanStats = urbanFC.map(computeAreas);
var ruralStats = ruralFC.map(computeAreas);

// 7) Inspect one feature to verify
print('Urban example:',  urbanStats.first());
print('Rural example:',  ruralStats.first());

// 8) Export as CSV to Drive (uncomment to run)
Export.table.toDrive({
  collection:     urbanStats,
  description:    'Urban_ESA_AreaByClass_VegNonVeg',
  folder:         'EarthEngineExports',
  fileNamePrefix: 'Urban_ESA_Areas_VegNonVeg',
  fileFormat:     'CSV'
});
Export.table.toDrive({
  collection:     ruralStats,
  description:    'Rural_ESA_AreaByClass_VegNonVeg',
  folder:         'EarthEngineExports',
  fileNamePrefix: 'Rural_ESA_Areas_VegNonVeg',
  fileFormat:     'CSV'
});

