"""River environment implementation.

Primary demonstration environment for the Environmental Intelligence Platform.
Focuses on fluvial dynamics, erosion detection, sediment shifts, and channel alterations.
"""

from app.environments.base import (
    BaseEnvironment,
    ProblemTypeDefinition,
    GuidedQuestion,
    ValidationRule,
)
from app.models.domain import EnvironmentType, SeverityLevel


class RiverEnvironment(BaseEnvironment):
    @property
    def environment_id(self) -> EnvironmentType:
        return EnvironmentType.RIVER

    @property
    def display_name(self) -> str:
        return "River Basin & Riparian Corridor"

    @property
    def description(self) -> str:
        return (
            "Monitors fluvial corridors, riverbanks, and active channels for morphology changes, "
            "erosion risks, sediment deposition, and water-surface extent shifts."
        )

    @property
    def is_primary(self) -> bool:
        return True

    @property
    def supported_problem_types(self) -> list[ProblemTypeDefinition]:
        return [
            ProblemTypeDefinition(
                problem_type_id="potential_riverbank_erosion",
                display_name="Potential Riverbank Erosion",
                description="Detected lateral bank retreat or embankment collapse along the river boundary.",
                default_severity=SeverityLevel.HIGH,
                recommended_action="Initiate field verification, evaluate embankment integrity, and alert local water resource authority.",
            ),
            ProblemTypeDefinition(
                problem_type_id="significant_water_area_change",
                display_name="Significant Water-Area Change",
                description="Substantial widening, narrowing, or migration of active surface water footprint.",
                default_severity=SeverityLevel.MEDIUM,
                recommended_action="Cross-reference hydrological flow gauge data and inspect upstream discharge controls.",
            ),
            ProblemTypeDefinition(
                problem_type_id="exposed_riverbed",
                display_name="Exposed Riverbed",
                description="Significant de-watering revealing submerged gravel bars, sediment shelves, or channel bed.",
                default_severity=SeverityLevel.MEDIUM,
                recommended_action="Assess ecological flow compliance and evaluate localized drought or diversion stress.",
            ),
            ProblemTypeDefinition(
                problem_type_id="potential_sediment_related_change",
                display_name="Potential Sediment-Related / Exposed-Bed Change",
                description="Visible accumulation of high-reflectance silt or sand deposits indicating deposition or scour.",
                default_severity=SeverityLevel.LOW,
                recommended_action="Perform sediment budget review and verify navigation / intake channel clearance.",
            ),
            ProblemTypeDefinition(
                problem_type_id="riverbank_movement",
                display_name="Riverbank Movement",
                description="Gradual meander shifting or channel realignment observed between comparative timestamps.",
                default_severity=SeverityLevel.MEDIUM,
                recommended_action="Update cadastral boundary mapping and schedule seasonal channel morphology survey.",
            ),
            ProblemTypeDefinition(
                problem_type_id="significant_water_body_change",
                display_name="Other Significant Water-Body Change",
                description="Unclassified surface water anomaly, backwater inundation, or oxbow lake disconnection.",
                default_severity=SeverityLevel.LOW,
                recommended_action="Conduct localized drone or ground reconnaissance.",
            ),
        ]

    @property
    def guided_questions(self) -> list[GuidedQuestion]:
        return [
            GuidedQuestion(
                id="river_basin_name",
                prompt="River Name and Basin / Reach",
                input_type="text",
                required=True,
                helper_text="e.g., Periyar River - Lower Reach, Reach KM 42-48",
            ),
            GuidedQuestion(
                id="recent_precipitation_event",
                prompt="Has there been a significant precipitation or dam discharge event within the last 14 days?",
                input_type="select",
                options=["Yes - Heavy Rainfall (>100mm)", "Yes - Dam Release", "No - Normal Flow", "Unknown"],
                required=True,
                helper_text="Helps distinguish seasonal surge levels from permanent bank alteration.",
            ),
            GuidedQuestion(
                id="seasonal_flow_stage",
                prompt="Hydrological Stage Comparison",
                input_type="select",
                options=[
                    "Same Season (Monsoon vs Monsoon)",
                    "Same Season (Dry vs Dry)",
                    "Cross-Season (Monsoon vs Dry)",
                    "Post-Flood Event Analysis",
                ],
                required=True,
                helper_text="Cross-seasonal comparisons require conservative change thresholding.",
            ),
            GuidedQuestion(
                id="infrastructure_proximity",
                prompt="Proximity to downstream bridges, flood embankments, or inhabited zones",
                input_type="select",
                options=["< 500m (Immediate Risk)", "500m - 2km (Moderate Risk)", "> 2km (Low Risk)"],
                required=False,
                helper_text="Directs automated investigation priority ranking.",
            ),
        ]

    @property
    def validation_rules(self) -> list[ValidationRule]:
        return [
            ValidationRule(
                key="allowed_formats",
                description="Accepted raster and imagery formats",
                rule_type="file_type",
                allowed_values=["image/png", "image/jpeg", "image/tiff", "image/geotiff"],
            ),
            ValidationRule(
                key="max_cloud_cover",
                description="Maximum acceptable cloud obscuration in riparian zone",
                rule_type="max_cloud_cover",
                threshold=25.0,
            ),
            ValidationRule(
                key="chronological_order",
                description="Before image acquisition date must precede After image date",
                rule_type="date_order",
            ),
        ]
