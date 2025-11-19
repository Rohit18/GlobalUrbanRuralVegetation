# Global Urban-Rural Vegetation Contrasts

**Authors:** Rohit Mukherjee, T.C. Chakraborty

## Overview
This repository contains the analytical framework and code for the study **"Global urban-rural contrasts in vegetation amount, subtype, and structure modulated by background climate and socioeconomic conditions"**.

### Paper Summary
This study presents a global assessment of vegetation characteristics across **83,102 urban clusters**. By moving beyond traditional spectral proxies (like NDVI), this analysis isolates specific structural and functional differences—specifically **Leaf Area Index (LAI)** and **Canopy Height**—between urban areas and their immediate rural surroundings.

**Key Insights:**
* **Structural Loss:** While urban areas generally have less vegetation, the loss of vertical structure (height and density) is often more pronounced than the loss of greenness coverage.
* **Socioeconomic Modulation:** Cities in the **Global North** exhibit larger urban-rural structural contrasts (e.g., taller rural trees compared to urban ones) than the **Global South**, despite the North having higher urban tree fractions overall.
* **Climate Context:** Arid cities show the least structural difference between urban and rural areas (often due to the "oasis effect"), whereas Continental and Temperate cities show the largest structural deficits.

---

## Methodology & Calculations
This codebase utilizes **Google Earth Engine** to perform multi-scalar geospatial analyses. The core calculations include:

### 1. Urban-Rural Delineation
* **Urban Clusters:** Defined using **ESA CCI Land Cover (2018)** built-up classes. Clusters are vectorized and filtered for a minimum area of **1 km²**.
* **Rural Reference Buffers:** Constructed using an iterative buffering algorithm (up to 10km) to identify a surrounding rural ring that matches the area of the urban cluster.

### 2. Vegetation Composition (2D)
Calculates the area-weighted mean ($\mu_{w}$) fractional cover for specific vegetation subtypes using **ESA WorldCover 2020** (10m resolution):
* Tree Cover
* Grassland
* Cropland
* Shrubland

### 3. Vegetation Structure (3D)
* **Leaf Area Index (LAI):** Derived from **Sentinel-2** imagery (2020) using a hybrid machine learning and radiative transfer model to estimate one-sided green leaf area per unit ground surface.
* **Canopy Height:** Extracted from the **Meta Canopy Height** dataset (1m resolution), masked to strictly include pixels classified as trees.
* **Urban-Rural Difference ($\Delta$):** Computed as $Urban_{value} - Rural_{value}$ for all metrics to quantify the biophysical impact of urbanization.

### 4. Spatiotemporal Stratification
* **Temporal Trends (1990–2020):** Uses **Landsat-based Global Land Cover** products to track 30-year shifts in vegetation composition.
* **Classification:** Stratifies results by **Global North/South** (World Bank income groups) and **Köppen-Geiger** climate zones.

---

## Data Sources
* **Land Cover:** ESA WorldCover 2020, ESA CCI Land Cover.
* **Canopy Height:** Meta Canopy Height (1m resolution).
* **Optical Imagery:** Sentinel-2 (for LAI generation), Landsat (for long-term analysis).