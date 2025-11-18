// Load the pre-mosaicked LAI image
var laiMosaic = ee.Image('projects/ee-mukherjeerishi/assets/LAI_Global_Mosaic_2020');

// Ensure the band is named 'LAI' (adjust if your mosaic has a different band name)
laiMosaic = laiMosaic.select([0]).rename('LAI');

print('LAI mosaic →', laiMosaic);

Map.addLayer(laiMosaic,
             {min: 0, max: 80, palette: ['white', 'green', 'darkgreen']},
             'LAI mosaic preview');

// Load Feature Collections for urban and rural clusters
var ruralFC = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalRural2018merged');
var urbanFC = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalUrban2018WithAreaIndex_above1km');

// 1. Create a tree mask from ESA WorldCover 2020
var esaWC = ee.Image('ESA/WorldCover/v100/2020').select('Map');
var treeMask = esaWC.eq(10); // Binary mask: 1 for trees, 0 for other classes

// 2. Apply the tree mask to the LAI mosaic
var laiTrees = laiMosaic.updateMask(treeMask);

Map.addLayer(laiTrees,
             {min: 0, max: 80, palette: ['#FFFAF000', 'lightgreen', 'darkgreen']},
             'LAI in Tree Areas Only');


// 3. Calculate mean LAI (filtered by trees) for EACH urban cluster
var urbanMeanLAIPerFeature = laiTrees.reduceRegions({
  collection: urbanFC,
  reducer: ee.Reducer.mean(),
  scale: 10
});

print('Mean LAI in Tree Areas per Urban Cluster (first 5):', urbanMeanLAIPerFeature.first());


// 4. Calculate mean LAI (filtered by trees) for EACH rural cluster
var ruralMeanLAIPerFeature = laiTrees.reduceRegions({
  collection: ruralFC,
  reducer: ee.Reducer.mean(),
  scale: 10
});

print('Mean LAI in Tree Areas per Rural Cluster (first 5):', ruralMeanLAIPerFeature.first());


// Export Urban Clusters with Mean LAI
Export.table.toDrive({
  collection: urbanMeanLAIPerFeature,
  description: 'urban_clusters_mean_tree_lai',
  folder: 'GEE_LAI_Exports',                  
  fileNamePrefix: 'urbanLAI_stats',     
  fileFormat: 'CSV'                       
});

// Export Rural Clusters with Mean LAI
Export.table.toDrive({
  collection: ruralMeanLAIPerFeature,
  description: 'rural_clusters_mean_tree_lai',
  folder: 'GEE_LAI_Exports',
  fileNamePrefix: 'ruralLAI_stats',
  fileFormat: 'CSV'
});
