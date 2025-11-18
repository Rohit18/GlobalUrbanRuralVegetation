// Urban vegetation inside built-up – tropical Af/Am/Aw – 1990-2020
// ----------------------------------------------------------------

// Inputs
var esacci = ee.Image('users/tirthankar25/ESA_CCI_1992_2020');     // b1–b29 = 1992-2020
var koppen = ee.Image('users/fsn1995/Global_19862010_KG_5m');
var world  = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);

// GLC-FCS30D vegetation rasters
var glc1990 = ee.ImageCollection('projects/sat-io/open-datasets/GLC-FCS30D/five-years-map')
                 .mosaic().select('b2');
var glc1995 = ee.ImageCollection('projects/sat-io/open-datasets/GLC-FCS30D/five-years-map')
                 .mosaic().select('b3');
var annual  = ee.ImageCollection('projects/sat-io/open-datasets/GLC-FCS30D/annual').mosaic();
var glc2000 = annual.select('b1');
var glc2005 = annual.select('b6');
var glc2010 = annual.select('b11');
var glc2015 = annual.select('b16');
var glc2020 = annual.select('b21');

// Helper → GLC image for a given year (client-side switch)
function glcImage(year){
  switch (year){
    case 1990: return glc1990;
    case 1995: return glc1995;
    case 2000: return glc2000;
    case 2005: return glc2005;
    case 2010: return glc2010;
    case 2015: return glc2015;
    default:   return glc2020;
  }
}

// Helper → ESA-CCI built-up mask ≥1992
function builtMaskImage(year){
  var band = 'b' + (year - 1991);          // 1992→b1 … 2020→b29
  return esacci.select(band).eq(190).selfMask();
}

// Constant masks
var tropMask = koppen.gte(0).and(koppen.lte(3)).selfMask();
var vegCodes = [10,11,12,20, 51,52,61,62,71,72,81,82,91,92,
                120,121,122, 130,140,150,152,153, 181,182,185,186];
function vegMask(img){
  return img.remap(vegCodes, ee.List.repeat(1, vegCodes.length), 0).selfMask();
}

// Robust pixel-area helper (returns ee.Number km² or null)
function areaKm2(maskImg){
  var band = maskImg.bandNames().get(0);
  var m2   = ee.Number(
               maskImg.multiply(ee.Image.pixelArea())
                      .reduceRegion({
                        reducer: ee.Reducer.sum(),
                        geometry: world,
                        scale: 1000,
                        maxPixels: 1e13
                      })
                      .get(band));                 // may be null
  return ee.Algorithms.If(m2, m2.divide(1e6), null);
}

// Years of interest
var years = [1992, 1995, 2000, 2005, 2010, 2015, 2020];

// Build one Feature per year (client-side loop; attributes are ee.Objects)
var feats = years.map(function(y){
  // Vegetation mask for this year, restricted to tropics
  var veg = vegMask(glcImage(y)).updateMask(tropMask);

  // Built-up (only exists for y ≥ 1992)
  var built = (y >= 1992) ? builtMaskImage(y).updateMask(tropMask) : null;

  // Areas
  var builtKm2     = built ? areaKm2(built) : null;
  var urbanVegKm2  = built ? areaKm2(veg.updateMask(built)) : null;
  var vegPct       = (built && urbanVegKm2)
                     ? ee.Number(urbanVegKm2).divide(builtKm2).multiply(100)
                     : null;

  return ee.Feature(null, {
    year:          y,
    built_km2:     builtKm2,
    urbanveg_km2:  urbanVegKm2,
    veg_pct:       vegPct
  });
});

// Output table
var table = ee.FeatureCollection(feats);
print('Urban vegetation vs. built-up area (tropical zone)', table);

// Optional export
// Export.table.toDrive({
//   collection: table,
//   description: 'TropicalUrbanVeg_1990_2020',
//   fileFormat: 'CSV'
// });
