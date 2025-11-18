# GlobalUrbanRuralVegetation
Global urban rural vegetation analysis including leaf area index and tree height


# GlobalUrbanRuralVegetation

A computational workflow for global urban–rural vegetation analysis, quantifying vegetation cover, canopy structure, and biophysical metrics across **83,000+ cities** worldwide. The repository contains reproducible scripts and notebooks for:

- Vegetation fractions (total + subtypes)
- Leaf Area Index (LAI; total + subtype-specific)
- Tree height
- Urban–rural difference metrics (Δ, Δw)
- Weighted statistics (Kish effective sample size)
- Climate stratification (Köppen A/B/C/D)
- Global North vs Global South cohorts
- Country-level aggregations
- Cartographic visualization (choropleths, scatter maps, histograms, stacked % bars)

The project integrates **Python**, **GeoPandas**, **NumPy/Pandas**, **Cartopy**, and **Google Earth Engine**, producing publication-ready figures for high-impact journal submissions.

---

## 🗂 Repository Structure

```
GlobalUrbanRuralVegetation/
│
├── notebooks/
│   ├── UFD_finalFigures.ipynb
│   ├── LAI_processing.ipynb
│   ├── vegetation_fraction_climate.ipynb
│   ├── vegetation_subtypes_climate.ipynb
│   ├── flood_and_rural_mask_checks.ipynb
│   └── misc_data_checks.ipynb
│
├── scripts/
│   ├── compute_LAI_summary.py
│   ├── compute_tree_height_summary.py
│   ├── compute_vegetation_summary.py
│   ├── vegetation_subtypes_summary.py
│   ├── country_map_LAI.py
│   ├── country_map_tree_height.py
│   ├── country_map_veg_fraction.py
│   ├── scatter_map_tree_height.py
│   └── utils_stats.py
│
├── data/
│   ├── combinedFeatures_VegBiomeKoppen_*.csv
│   ├── combinedFeatures_TreesBiomeKoppen_*.csv
│   └── LAI/TreeHeight auxiliary layers
│
├── figures/
│
└── README.md
```

---

## 🔍 Core Analyses

### 1. Urban–Rural Vegetation Fractions
Scripts compute:
- Fractional vegetation cover (urban & rural)
- Subtype fractions (tree, grassland, shrubland, cropland)
- Paired differences:
  ```
  Δ  = mean(urban − rural)
  Δw = weighted mean difference (Urban_Area + Buffer_area)
  ```

### 2. Leaf Area Index (LAI)
- LAI rescaled (÷10) as needed
- Total & subtype LAI
- Weighted means using **Kish n_eff**
- Paired effect sizes (Cohen’s d, rank-biserial r, U>R metrics)

### 3. Tree Height
- Height normalized by **tree cover area**
- Urban–rural paired differences
- Weighted effect sizes
- Scatter maps and climate-wise breakdowns

### 4. Climate Stratification
Climate class based on first letter of `koppen_name_urban`:
- A = Tropical  
- B = Arid  
- C = Temperate  
- D = Continental

Outputs generated for:
- All cities  
- Top 1,000 by Urban_Area  
- Each climate class × metric

### 5. Cartography & Figures
Scripts generate publication-grade maps:
- Symmetric diverging palettes centered on **0**
- Discrete bins (8–10 classes)
- Minimalist histograms matched to map bins
- Stacked percentage bars (U<R / U==R / U>R)

Figures exported as vector **PDF**.

---

## 📦 Data Inputs

Most inputs originate from **Google Earth Engine exports**, including:
- LAI and tree-height mosaics  
- `globalUrban2018WithAreaIndex`, `globalRural2018merged`
- Biome layers and Köppen climate classification  
- Auxiliary rasters: DynamicWorld, ESA WorldCover, etc.

Local CSVs generally follow:

```
combinedFeatures_*_withLatLon_with_countries.csv
```

Each row contains:
- Urban & Rural areas
- Vegetation/LAI/height values
- Lat/lon for mapping
- Climate class
- Biome
- Global North/South indicator

---

## 🧮 Statistical Framework

### Weighted Means
```
μw = Σ(w_i * x_i) / Σ w_i
```

### Kish Effective Sample Size
```
n_eff = (Σ w_i)^2 / Σ(w_i^2)
SEw = sd_w / sqrt(n_eff)
```

### Effect Sizes
- Cohen’s d / Hedges g  
- Rank-biserial correlation  
- Percentages for U>R, U<R, U==R

**All map and table scripts use a unified, consistent weighting framework.**

---

## ▶️ How to Run

Example (LAI summary):

```bash
python scripts/compute_LAI_summary.py \
    --csv data/combinedFeatures_LAI.csv \
    --out results/summary_LAI.csv
```

Example (country map):

```bash
python scripts/country_map_LAI.py \
    --csv data/combinedFeatures_LAI.csv \
    --out_map figures/LAI_map.pdf \
    --out_hist figures/LAI_hist.pdf
```

The notebooks in `/notebooks` reproduce the full workflow end-to-end.

---

## 📝 Reproducibility & Archiving

This repository contains **data-processing code only**.  
For publication, you can archive a tagged release using **Zenodo**, which will automatically generate a DOI.

---

## 📄 License

MIT License (update if needed).