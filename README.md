# Global urban-rural vegetation contrasts

**Authors:** Rohit Mukherjee, T.C. Chakraborty

**Data:** [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17644251.svg)](https://doi.org/10.5281/zenodo.17644251)
<br>
**Code:** [![DOI](https://zenodo.org/badge/1099114327.svg)](https://doi.org/10.5281/zenodo.17664383)

## Overview
This repository contains the Google Earth Engine (GEE) and Python code for the study **"Global urban-rural contrasts in vegetation amount, subtype, and structure modulated by background climate and socioeconomic conditions"**.

### Paper summary
This study presents a global assessment of vegetation characteristics across **83,102 urban clusters**. By moving beyond traditional spectral proxies (like NDVI, EVI), this analysis isolates specific structural and functional differences, specifically **Leaf Area Index (LAI)** and **Tree Height**, between urban areas and their immediate rural surroundings.

**Key insights:**
* **Structural loss:** While urban areas generally have less vegetation, the loss of vertical structure (height and density) is often more pronounced than the loss of greenness coverage.
* **Socioeconomic conditions:** Cities in the **Global North** exhibit larger urban-rural structural contrasts (e.g., taller rural trees compared to urban ones) than the **Global South**, despite the North having higher urban tree fractions overall.
* **Climate context:** Arid cities show the least structural difference between urban and rural areas, whereas Continental and Temperate cities show the largest structural deficits.

---

## Primary analysis
This codebase uses GEE to generate datasets and Python for analysis.

**1. Vegetation subtype composition:** Calculated using ESA WorldCover 2020 (10m) for Tree Cover, Grassland, Cropland, Shrubland, and Total Vegetation.

**2. Vegetation structure:** Analysis of Leaf Area Index (LAI) from Sentinel-2 and Canopy Height from Meta Canopy Height (1m).

**3. Temporal analysis:** Tracking 30-year shifts (1990–2020) using Landsat-based Global Land Cover.

---

## Dataset files
The processed datasets are published on Zenodo (DOI: 10.5281/zenodo.17644251).

### Vegetation cover (ESA WorldCover)
* `urbanRural_VegBiomeKoppen_withLatLon_with_countries.csv`
* `urbanRural_VegBiomeKoppen_withLatLon_with_countries_global_ns.csv`

### Leaf area index (LAI)
* `urbanRuralLAI_with_countries_veg.csv`
* `urbanRuralLAI_with_countries_global_ns_veg.csv`

### Tree height (Meta canopy height)
* `urbanRural_TreesBiomeKoppen_withLatLon_with_countries.csv`

### Vegetation indices (NDVI & EVI)
_EVI_
* `urbanRural_EVIBiomeKoppen_withLatLon_with_countries_global_ns.csv`
* `urbanRural_EVIBiomeKoppen_withLatLon_with_countries.csv`
_Country-level temporal EVI change between 1990 and 2020_
* `urbanEVI_1990_perCountry.csv`
* `urbanEVI_2020_perCountry.csv`

_NDVI_
* `urbanRural_NDVIBiomeKoppen_withLatLon_with_countries_global_ns.csv`
* `urbanRural_NDVIBiomeKoppen_withLatLon_with_countries.csv`
_Country-level temporal NDVI change between 1990 and 2020_
* `urbanNDVI_1990_perCountry.csv`
* `urbanNDVI_2020_perCountry.csv`

### Country-level temporal analysis: fixed urban extents (1990 & 2020)
_Vegetation_
* `vegUrban_1990_2020_constBuiltUp2020_100m.csv`
* `vegUrban_1990_2020_constBuiltUp1992_100m.csv`
_Tree_
* `treeUrban_1990_2020_constBuiltUp2020_100m.csv`
* `treeUrban_1990_2020_constBuiltUp1992_100m.csv`

### Temporal change (1990 vs 2020)
_Vegetation_
* `vegUrban_2020_constBuiltUp2020_100m.csv`
* `vegUrban_1990_constBuiltUp1992_100m.csv`
_Tree_
* `treeUrban_2020_constBuiltUp2020_100m.csv`
* `treeUrban_1990_constBuiltUp1992_100m.csv`
_Crop_
* `croplandUrban_1990_constBuiltUp1990_100m.csv`
* `croplandUrban_2020_constBuiltUp2020_100m.csv`
_Grass_
* `grassUrban_1990_constBuiltUp1990_100m.csv`
* `grassUrban_2020_constBuiltUp2020_100m.csv`
_Shrub_
* `shrubUrban_1990_constBuiltUp1990_100m.csv`
* `shrubUrban_2020_constBuiltUp2020_100m.csv`

### Temporal change: 5-Year increments
_Vegetation_
* `vegUrban1990.csv`
* `vegUrban1995.csv`
* `vegUrban2000.csv`
* `vegUrban2005.csv`
* `vegUrban2010.csv`
* `vegUrban2015.csv`
* `vegUrban2020.csv`

_Tree_
* `treeUrban1990.csv`
* `treeUrban1995.csv`
* `treeUrban2000.csv`
* `treeUrban2005.csv`
* `treeUrban2010.csv`
* `treeUrban2015.csv`
* `treeUrban2020.csv`

### Climate zone analysis
_Vegetation_
* `urbanVegetationClimate_1990_2020_tropical.csv`
* `urbanVegetationClimate_1992_2020_arid.csv`
* `urbanVegetationClimate_1990_2020_continental.csv`
* `urbanVegetationClimate_1990_2020_temperate_100m.csv`

_Tree_
* `urbanTreeCover_1992_2020_tropical.csv`
* `urbanTreeCover_1992_2020_continental.csv`
* `urbanTreeCover_1992_2020_arid.csv`
* `urbanTreeCover_1992_2020_temperate.csv`

---

## Data Sources
* **Land Cover:** ESA WorldCover 2020, ESA CCI Land Cover, Landsat-based Global Land Cover (GLC_FCS30D).
* **Canopy Height:** Meta Canopy Height (1m resolution).
* **Optical Imagery:** Sentinel-2 (for LAI generation), Landsat (for long-term analysis).