// Load the Meta Canopy Height dataset and create a mosaic.
var canopyMeta = ee.ImageCollection('projects/meta-forest-monitoring-okw37/assets/CanopyHeight').mosaic();

// Load the rural and urban feature collections.
var rural = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalRural2018merged');
var urban = ee.FeatureCollection('projects/ee-mukherjeerishi/assets/globalUrban2018WithAreaIndex_above1km');
 
// Create a mask to ignore pixels with zero tree height.
var canopyMask = canopyMeta.gt(0);
var maskedCanopy = canopyMeta.updateMask(canopyMask);

print(maskedCanopy)

// Function to calculate the mean tree height for each feature (cluster).
var calculateMeanHeight = function(feature) {
  // Get the geometry of the feature.
  var geometry = feature.geometry();

  // Calculate the mean of the masked canopy height image within the feature's geometry.
  var meanHeight = maskedCanopy.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1,
    maxPixels: 1e13
  });

  // Return the feature with the new 'mean_tree_height' property.
  return feature.set('mean_tree_height', meanHeight.get('cover_code')); // The band is named 'b1' after mosaicking
};

// Apply the function to both the rural and urban feature collections.
var ruralWithMeanHeight = rural.map(calculateMeanHeight);
var urbanWithMeanHeight = urban.map(calculateMeanHeight);

// Print the first feature of each collection to verify the result.
print('Rural feature with mean tree height:', ruralWithMeanHeight.first());
print('Urban feature with mean tree height:', urbanWithMeanHeight.first());

// Optional: Export the results to your Google Drive as a CSV file.

// Export the rural features with the calculated mean tree height.
Export.table.toDrive({
  collection: ruralWithMeanHeight,
  description: 'rural_mean_tree_height',
  fileFormat: 'CSV'
});

// Export the urban features with the calculated mean tree height.
Export.table.toDrive({
  collection: urbanWithMeanHeight,
  description: 'urban_mean_tree_height',
  fileFormat: 'CSV'
});
