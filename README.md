# Environmental Intelligence Platform

> AI-assisted environmental monitoring that turns before-and-after imagery into actionable, evidence-based environmental intelligence.

The **Environmental Intelligence Platform** is a web-based platform for environmental and disaster-management teams to monitor geographic areas, compare environmental imagery over time, identify meaningful changes, investigate potential environmental problems, and generate evidence-backed reports for human review.

The platform is designed to work across multiple environmental domains rather than being limited to a single river or location.

**Primary environments:** River · Landslide
**Primary user:** Environmental / Disaster Management Officer
**Secondary user:** Citizen

---

## Overview

Environmental changes are often difficult to detect manually, especially when monitoring large or geographically distributed areas.

The Environmental Intelligence Platform provides a structured workflow:

```text
Upload Before + After Imagery
            ↓
       Validate Inputs
            ↓
      Detect Visual Change
            ↓
   Identify Potential Problems
            ↓
   Show Evidence + Confidence
            ↓
      Map Investigation Areas
            ↓
       Human Verification
            ↓
       Generate Report
```

The goal is not to replace environmental experts.

Instead, the platform helps experts **find important changes faster, understand why the system flagged them, and make better-informed decisions.**

---

## Key Features

### 🛰️ Before / After Change Detection

Upload two images representing the same area at different points in time.

The system performs image preprocessing and comparison to identify meaningful visual changes.

Outputs include:

* Change mask
* Changed regions
* Change percentage
* Change severity
* Visual overlays
* Before/after comparison
* Alignment quality indicators

---

### 🌊 River Monitoring

The River environment supports detection of potential changes such as:

* Potential riverbank erosion
* Significant water-area change
* Exposed riverbed
* Potential sediment-related / exposed-bed change
* Riverbank movement
* Other significant water-body changes

The system can incorporate investigation context such as:

* Basin
* Recent rainfall
* Dam releases
* Seasonal flow conditions
* Nearby infrastructure

---

### ⛰️ Landslide Monitoring

The Landslide environment supports detection of potential:

* Landslide-related change
* Terrain disturbance
* Vegetation loss / canopy stripping
* Exposed ground and colluvium

Investigation context can include:

* Sector
* Antecedent rainfall
* Slope gradient
* Downslope infrastructure or settlements

---

### 🧠 AI-Assisted Environmental Interpretation

The platform uses a hybrid approach.

Image processing is responsible for identifying visual change, while environmental interpretation uses image-derived features and environment-specific rules/classification.

The system considers signals such as:

* Changed area
* Change intensity
* Shape and compactness
* Region orientation
* Spatial position
* Water-like characteristics
* Vegetation-like characteristics
* Exposed-ground characteristics
* Connected regions
* Image alignment quality

Where appropriate, language models may assist with explanation wording and report generation, but they are **not treated as the sole source of visual classification.**

---

## Evidence-First AI

Every AI finding is designed around three questions:

### What?

**What potential environmental problem was detected?**

Example:

> Potential Riverbank Erosion

### How confident?

The system reports classification confidence separately from environmental or disaster probability.

Example:

> Confidence: 86% — High

### Why?

The system provides evidence supporting the finding.

Example:

```text
Evidence
• 14.8% localized image change
• Change concentrated along the riverbank
• Elongated boundary consistent with bank movement
```
