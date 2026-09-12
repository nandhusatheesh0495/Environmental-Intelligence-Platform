/**
 * Frontend Environment Registry and Definitions.
 * 
 * Provides static fallback and contract structures matching backend environments.
 */

import { EnvironmentDefinition } from "./types";

export const RIVER_ENVIRONMENT: EnvironmentDefinition = {
  environment_id: "river",
  display_name: "River Basin & Riparian Corridor",
  description:
    "Monitors fluvial corridors, riverbanks, and active channels for morphology changes, erosion risks, sediment deposition, and water-surface extent shifts.",
  is_primary: true,
  supported_problem_types: [
    {
      problem_type_id: "potential_riverbank_erosion",
      display_name: "Potential Riverbank Erosion",
      description: "Detected lateral bank retreat or embankment collapse along the river boundary.",
      default_severity: "high",
      recommended_action: "Initiate field verification, evaluate embankment integrity, and alert local water authority.",
    },
    {
      problem_type_id: "significant_water_area_change",
      display_name: "Significant Water-Area Change",
      description: "Substantial widening, narrowing, or migration of active surface water footprint.",
      default_severity: "medium",
      recommended_action: "Cross-reference hydrological flow gauge data and inspect upstream discharge controls.",
    },
    {
      problem_type_id: "exposed_riverbed",
      display_name: "Exposed Riverbed",
      description: "Significant de-watering revealing submerged gravel bars, sediment shelves, or channel bed.",
      default_severity: "medium",
      recommended_action: "Assess ecological flow compliance and evaluate localized drought or diversion stress.",
    },
    {
      problem_type_id: "potential_sediment_related_change",
      display_name: "Potential Sediment-Related / Exposed-Bed Change",
      description: "Visible accumulation of high-reflectance silt or sand deposits indicating deposition or scour.",
      default_severity: "low",
      recommended_action: "Perform sediment budget review and verify navigation / intake channel clearance.",
    },
    {
      problem_type_id: "riverbank_movement",
      display_name: "Riverbank Movement",
      description: "Gradual meander shifting or channel realignment observed between comparative timestamps.",
      default_severity: "medium",
      recommended_action: "Update cadastral boundary mapping and schedule seasonal channel morphology survey.",
    },
    {
      problem_type_id: "significant_water_body_change",
      display_name: "Other Significant Water-Body Change",
      description: "Unclassified surface water anomaly, backwater inundation, or oxbow lake disconnection.",
      default_severity: "low",
      recommended_action: "Conduct localized drone or ground reconnaissance.",
    },
  ],
  guided_questions: [
    {
      id: "river_basin_name",
      prompt: "River Name and Basin / Reach",
      input_type: "text",
      required: true,
      helper_text: "e.g., Periyar River - Lower Reach, Reach KM 42-48",
    },
    {
      id: "recent_precipitation_event",
      prompt: "Has there been a significant precipitation or dam discharge event within the last 14 days?",
      input_type: "select",
      options: ["Yes - Heavy Rainfall (>100mm)", "Yes - Dam Release", "No - Normal Flow", "Unknown"],
      required: true,
      helper_text: "Helps distinguish seasonal surge levels from permanent bank alteration.",
    },
    {
      id: "seasonal_flow_stage",
      prompt: "Hydrological Stage Comparison",
      input_type: "select",
      options: [
        "Same Season (Monsoon vs Monsoon)",
        "Same Season (Dry vs Dry)",
        "Cross-Season (Monsoon vs Dry)",
        "Post-Flood Event Analysis",
      ],
      required: true,
      helper_text: "Cross-seasonal comparisons require conservative change thresholding.",
    },
    {
      id: "infrastructure_proximity",
      prompt: "Proximity to downstream bridges, flood embankments, or inhabited zones",
      input_type: "select",
      options: ["< 500m (Immediate Risk)", "500m - 2km (Moderate Risk)", "> 2km (Low Risk)"],
      required: false,
      helper_text: "Directs automated investigation priority ranking.",
    },
  ],
  validation_rules: [
    {
      key: "allowed_formats",
      description: "Accepted raster and imagery formats",
      rule_type: "file_type",
      allowed_values: ["image/png", "image/jpeg", "image/tiff", "image/geotiff"],
    },
    {
      key: "max_cloud_cover",
      description: "Maximum acceptable cloud obscuration in riparian zone",
      rule_type: "max_cloud_cover",
      threshold: 25.0,
    },
  ],
};

export const LANDSLIDE_ENVIRONMENT: EnvironmentDefinition = {
  environment_id: "landslide",
  display_name: "Slope & Landslide Risk Corridor",
  description:
    "Monitors mountainous and hilly terrain for slope failure, crown scarp development, abrupt vegetation canopy loss, and debris flow displacement.",
  is_primary: false,
  supported_problem_types: [
    {
      problem_type_id: "potential_landslide_related_change",
      display_name: "Potential Landslide-related Change",
      description: "Composite detection of crown scarp, displaced slope material, or debris trail.",
      default_severity: "critical",
      recommended_action: "Dispatch geological hazard assessment unit and verify downslope transit corridor safety.",
    },
    {
      problem_type_id: "terrain_disturbance",
      display_name: "Potential Terrain Disturbance",
      description: "Disruption of slope surface texture, tensile cracks, or localized earth slip.",
      default_severity: "high",
      recommended_action: "Install slope extensometers or conduct UAV photogrammetry survey.",
    },
    {
      problem_type_id: "vegetation_loss",
      display_name: "Vegetation Loss / Canopy Stripping",
      description: "Rapid depletion of forest canopy exposing underlying soil or bedrock on inclined terrain.",
      default_severity: "medium",
      recommended_action: "Cross-reference with forestry logging records and inspect for underlying slip vectors.",
    },
    {
      problem_type_id: "exposed_ground",
      display_name: "Exposed Ground & Colluvium",
      description: "Spectral signature transition from vegetated cover to bare geological substrate or talus.",
      default_severity: "medium",
      recommended_action: "Assess catchment erosion potential and sediment delivery to drainage channels.",
    },
  ],
  guided_questions: [
    {
      id: "slope_sector_name",
      prompt: "Slope / Mountain Range Sector",
      input_type: "text",
      required: true,
      helper_text: "e.g., Western Ghats - Wayanad Ridge Sector B",
    },
    {
      id: "precipitation_trigger",
      prompt: "Antecedent Precipitation Conditions (Past 72 hours)",
      input_type: "select",
      options: [
        "Extreme Rainfall (>200mm in 24h)",
        "Persistent Heavy Monsoonal Rain",
        "Moderate Precipitation",
        "Dry Conditions (Possible Seismic/Excavation Trigger)",
      ],
      required: true,
      helper_text: "Hydrological saturation is the primary triggering agent for mass movements.",
    },
    {
      id: "slope_angle_estimate",
      prompt: "Estimated Slope Gradient",
      input_type: "select",
      options: ["Steep (> 35°)", "Moderate (20° - 35°)", "Gentle (< 20°)"],
      required: false,
      helper_text: "Slopes >30° carry elevated vulnerability under high moisture saturation.",
    },
    {
      id: "downslope_exposure",
      prompt: "Elements at Downslope Risk",
      input_type: "select",
      options: [
        "Transportation Arteries / Highways",
        "Residential Settlements / Villages",
        "Agricultural Terraces",
        "Wilderness / Protected Forest",
      ],
      required: true,
      helper_text: "Crucial for human review prioritization and rapid response staging.",
    },
  ],
  validation_rules: [
    {
      key: "allowed_formats",
      description: "Accepted imagery formats",
      rule_type: "file_type",
      allowed_values: ["image/png", "image/jpeg", "image/tiff", "image/geotiff"],
    },
    {
      key: "max_cloud_cover",
      description: "Maximum acceptable cloud obscuration",
      rule_type: "max_cloud_cover",
      threshold: 20.0,
    },
  ],
};

export const REGISTERED_ENVIRONMENTS: EnvironmentDefinition[] = [
  RIVER_ENVIRONMENT,
  LANDSLIDE_ENVIRONMENT,
];

export function getEnvironment(id: string): EnvironmentDefinition | undefined {
  return REGISTERED_ENVIRONMENTS.find((e) => e.environment_id === id);
}
