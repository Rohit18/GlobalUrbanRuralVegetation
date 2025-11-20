# Global Urban-Rural Vegetation Contrasts

**Authors:** Rohit Mukherjee, TC Chakraborty

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17644251.svg)](https://doi.org/10.5281/zenodo.17644251)

## 📖 Overview
This repository contains the Google Earth Engine (GEE) and Python code for the study: **"Global urban-rural contrasts in vegetation amount, subtype, and structure modulated by background climate and socioeconomic conditions"**.

### Paper Summary
This study presents a global assessment of vegetation characteristics across **83,102 urban and rural clusters**. By moving beyond traditional spectral proxies (like NDVI, EVI), this analysis isolates vegetation structural and functional differences—specifically **Leaf Area Index (LAI)** and **Tree Height** across urban areas and their immediate rural surroundings.

**Key Insights:**
* **Structural Loss:** While urban areas generally have less vegetation, the loss of vertical structure (height and density) is often more pronounced than the loss of greenness.
* **Socioeconomic Conditions:** Cities in the **Global North** exhibit larger urban-rural structural contrasts (e.g., taller rural trees compared to urban ones) than the **Global South**, despite the North having higher urban tree fractions overall.
* **Climate Context:** Arid cities show the least structural difference between urban and rural areas (often due to the "oasis effect"), whereas Continental and Temperate cities show the largest structural deficits.

---

## 🔍 Primary Analysis
This codebase utilizes GEE to generate datasets and Python to process, analyze, and plot the data. The primary parameters analyzed include:

### 1. Vegetation and Subtype Composition
Calculates the area-weighted mean ($\mu_{w}$) fractional cover for specific vegetation subtypes using **ESA WorldCover 2020** (10m resolution):
* Tree Cover
* Grassland
* Cropland
* Shrubland
* All Vegetation (including Mangrove, Moss, and Lichen)
* NDVI, EVI

### 2. Vegetation Structure
* **Leaf Area Index (LAI):** Derived from **Sentinel-2** imagery (2020) using a hybrid machine learning and radiative transfer model to estimate one-sided green leaf area per unit ground surface.
* **Canopy Height:** Extracted from the **Meta Canopy Height** dataset (1m resolution), masked to strictly include pixels classified as trees.

### 3. Temporal Analysis
* **Temporal Trends (1990–2020):** Uses **Landsat-based Global Land Cover** products to track 30-year shifts in vegetation composition.
* **Classification:** Stratifies results by **Global North/South** (World Bank income groups) and **Köppen-Geiger** climate zones.

---

#### Vegetation Cover (ESA WorldCover 2020)
| Description | Filename |
| :--- | :--- |
| **Global Veg Cover** | `urbanRural_VegBiomeKoppen_withLatLon_with_countries.csv` |
| **Global North/South Split** | `urbanRural_VegBiomeKoppen_withLatLon_with_countries_global_ns.csv` |

#### Temporal Analysis (Fixed Extents)
| Period | Description | Filenames |
| :--- | :--- | :--- |
| **5-Year Intervals** | Vegetation & Tree trends | `vegUrban_1990_2020_constBuiltUp2020_100m.csv`<br>`vegUrban_1990_2020_constBuiltUp1992_100m.csv`<br>`treeUrban_1990_2020_constBuiltUp2020_100m.csv`<br>`treeUrban_1990_2020_constBuiltUp1992_100m.csv` |
| **1990 vs 2020** | Change per subtype | `vegUrban_2020_constBuiltUp2020_100m.csv`<br>`vegUrban_1990_constBuiltUp1992_100m.csv`<br>`treeUrban_2020_constBuiltUp2020_100m.csv`<br>`treeUrban_1990_constBuiltUp1992_100m.csv`<br>`croplandUrban_[YEAR]_constBuiltUp[YEAR]_100m.csv`<br>`grassUrban_[YEAR]_constBuiltUp[YEAR]_100m.csv`<br>`shrubUrban_[YEAR]_constBuiltUp[YEAR]_100m.csv` |
| **5-Year % Change** | Incremental change files | `vegUrban[YEAR].csv` (1990-2020)<br>`treeUrban[YEAR].csv` (1990-2020) |

#### Structural Metrics
| Metric | Filenames |
| :--- | :--- |
| **Leaf Area Index (LAI)** | `urbanRuralLAI_with_countries_veg.csv`<br>`urbanRuralLAI_with_countries_global_ns_veg.csv` |
| **Tree Height** | `urbanRural_TreesBiomeKoppen_withLatLon_with_countries.csv` |
| **EVI** | `urbanRural_EVIBiomeKoppen_withLatLon_with_countries_global_ns.csv`<br>`urbanRural_EVIBiomeKoppen_withLatLon_with_countries.csv` |
| **NDVI** | `urbanRural_NDVIBiomeKoppen_withLatLon_with_countries_global_ns.csv`<br>`urbanRural_NDVIBiomeKoppen_withLatLon_with_countries.csv` |

#### Climate Zone Breakdowns
| Category | Filenames |
| :--- | :--- |
| **Vegetation** | `urbanVegetationClimate_1990_2020_tropical.csv`<br>`urbanVegetationClimate_1992_2020_arid.csv`<br>`urbanVegetationClimate_1990_2020_continental.csv`<br>`urbanVegetationClimate_1990_2020_temperate_100m.csv` |
| **Tree Cover** | `urbanTreeCover_1992_2020_tropical.csv`<br>`urbanTreeCover_1992_2020_continental.csv`<br>`urbanTreeCover_1992_2020_arid.csv`<br>`urbanTreeCover_1992_2020_temperate.csv` |

---

## Data sources
* **Land cover:** ESA WorldCover 2020, ESA CCI Land Cover, Landsat-based Global Land Cover (GLC_FCS30D).
* **Canopy height:** Meta Canopy Height (1m resolution).
* **Optical imagery:** Sentinel-2 (for LAI generation), Landsat (for long-term analysis).