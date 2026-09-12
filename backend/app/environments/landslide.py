"""Landslide environment implementation.

Secondary demonstration environment for the Environmental Intelligence Platform.
Focuses on slope instability, mass movement, scarp formation, and vegetation scar analysis.
"""

from app.environments.base import (
    BaseEnvironment,
    ProblemTypeDefinition,
    GuidedQuestion,
    ValidationRule,
)
from app.models.domain import EnvironmentType, SeverityLevel


class LandslideEnvironment(BaseEnvironment):
    @property
    def environment_id(self) -> EnvironmentType:
        return EnvironmentType.LANDSLIDE

    @property
    def display_name(self) -> str:
        return "Slope & Landslide Risk Corridor"

    @property
    def description(self) -> str:
        return (
            "Monitors mountainous and hilly terrain for slope failure, crown scarp development, "
            "abrupt vegetation canopy loss, and debris flow displacement."
        )

    @property
    def is_primary(self) -> bool:
        return False

    @property
    def supported_problem_types(self) -> list[ProblemTypeDefinition]:
        return [
            ProblemTypeDefinition(
                problem_type_id="potential_landslide_related_change",
                display_name="Potential Landslide-related Change",
                description="Composite detection of crown scarp, displaced slope material, or debris trail.",
                default_severity=SeverityLevel.CRITICAL,
                recommended_action="Dispatch geological hazard assessment unit and verify downslope transit corridor safety.",
            ),
            ProblemTypeDefinition(
                problem_type_id="terrain_disturbance",
                display_name="Potential Terrain Disturbance",
                description="Disruption of slope surface texture, tensile cracks, or localized earth slip.",
                default_severity=SeverityLevel.HIGH,
                recommended_action="Install slope extensometers or conduct UAV photogrammetry survey.",
            ),
            ProblemTypeDefinition(
                problem_type_id="vegetation_loss",
                display_name="Vegetation Loss / Canopy Stripping",
                description="Rapid depletion of forest canopy exposing underlying soil or bedrock on inclined terrain.",
                default_severity=SeverityLevel.MEDIUM,
                recommended_action="Cross-reference with forestry logging records and inspect for underlying slip vectors.",
            ),
            ProblemTypeDefinition(
                problem_type_id="exposed_ground",
                display_name="Exposed Ground & Colluvium",
                description="Spectral signature transition from vegetated cover to bare geological substrate or talus.",
                default_severity=SeverityLevel.MEDIUM,
                recommended_action="Assess catchment erosion potential and sediment delivery to drainage channels.",
            ),
        ]

    @property
    def guided_questions(self) -> list[GuidedQuestion]:
        return [
            GuidedQuestion(
                id="slope_sector_name",
                prompt="Slope / Mountain Range Sector",
                input_type="text",
                required=True,
                helper_text="e.g., Western Ghats - Wayanad Ridge Sector B",
            ),
            GuidedQuestion(
                id="precipitation_trigger",
                prompt="Antecedent Precipitation Conditions (Past 72 hours)",
                input_type="select",
                options=[
                    "Extreme Rainfall (>200mm in 24h)",
                    "Persistent Heavy Monsoonal Rain",
                    "Moderate Precipitation",
                    "Dry Conditions (Possible Seismic/Excavation Trigger)",
                ],
                required=True,
                helper_text="Hydrological saturation is the primary triggering agent for mass movements.",
            ),
            GuidedQuestion(
                id="slope_angle_estimate",
                prompt="Estimated Slope Gradient",
                input_type="select",
                options=["Steep (> 35°)", "Moderate (20° - 35°)", "Gentle (< 20°)"],
                required=False,
                helper_text="Slopes >30° carry elevated vulnerability under high moisture saturation.",
            ),
            GuidedQuestion(
                id="downslope_exposure",
                prompt="Elements at Downslope Risk",
                input_type="select",
                options=[
                    "Transportation Arteries / Highways",
                    "Residential Settlements / Villages",
                    "Agricultural Terraces",
                    "Wilderness / Protected Forest",
                ],
                required=True,
                helper_text="Crucial for human review prioritization and rapid response staging.",
            ),
        ]

    @property
    def validation_rules(self) -> list[ValidationRule]:
        return [
            ValidationRule(
                key="allowed_formats",
                description="Accepted imagery formats",
                rule_type="file_type",
                allowed_values=["image/png", "image/jpeg", "image/tiff", "image/geotiff"],
            ),
            ValidationRule(
                key="max_cloud_cover",
                description="Maximum acceptable cloud obscuration",
                rule_type="max_cloud_cover",
                threshold=20.0,
            ),
            ValidationRule(
                key="chronological_order",
                description="Before image acquisition date must precede After image date",
                rule_type="date_order",
            ),
        ]
