# Global urban-rural vegetation contrasts

**Authors:** Rohit Mukherjee, T.C. Chakraborty

## Overview
This repository contains the Google Earth Engine (GEE) and python code for the study **"Global urban-rural contrasts in vegetation amount, subtype, and structure modulated by background climate and socioeconomic conditions"**.

### Paper summary
This study presents a global assessment of vegetation characteristics across **83,102 urban clusters**. By moving beyond traditional spectral proxies (like NDVI), this analysis isolates specific structural and functional differences—specifically **Leaf Area Index (LAI)** and **Tree Height**—between urban areas and their immediate rural surroundings.

**Key insights:**
* **Structural Loss:** While urban areas generally have less vegetation, the loss of vertical structure (height and density) is often more pronounced than the loss of greenness coverage.
* **Socioeconomic conditions:** Cities in the **Global North** exhibit larger urban-rural structural contrasts (e.g., taller rural trees compared to urban ones) than the **Global South**, despite the North having higher urban tree fractions overall.
* **Climate Context:** Arid cities show the least structural difference between urban and rural areas (often due to the "oasis effect"), whereas Continental and Temperate cities show the largest structural deficits.

---

## Primary analysis
This codebase utilizes GEE to generate datasets, and python to process these datasets, analyze, and plot. The primary parameters analyzed include:

### 1. Vegetation and subtype composition
Calculates the area-weighted mean ($\mu_{w}$) fractional cover for specific vegetation subtypes using **ESA WorldCover 2020** (10m resolution):
* Tree Cover
* Grassland
* Cropland
* Shrubland
* all Vegetation (including Mangrove, Moss and lichen)
* NDVI, EVI

### 2. Vegetation structure
* **Leaf Area Index (LAI):** Derived from **Sentinel-2** imagery (2020) using a hybrid machine learning and radiative transfer model to estimate one-sided green leaf area per unit ground surface.
* **Canopy Height:** Extracted from the **Meta Canopy Height** dataset (1m resolution), masked to strictly include pixels classified as trees.

### 3. Temporal analysis
* **Temporal Trends (1990–2020):** Uses **Landsat-based Global Land Cover** products to track 30-year shifts in vegetation composition.
* **Classification:** Stratifies results by **Global North/South** (World Bank income groups) and **Köppen-Geiger** climate zones.

---

## Data sources
* **Land cover:** ESA WorldCover 2020, ESA CCI Land Cover, Landsat-based Global Land Cover (GLC_FCS30D).
* **Canopy height:** Meta Canopy Height (1m resolution).
* **Optical imagery:** Sentinel-2 (for LAI generation), Landsat (for long-term analysis).