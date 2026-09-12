"""Unit tests for environment abstraction and registry."""

from app.environments.base import BaseEnvironment, ProblemTypeDefinition
from app.environments.river import RiverEnvironment
from app.environments.landslide import LandslideEnvironment
from app.environments.registry import EnvironmentRegistry, environment_registry
from app.models.domain import EnvironmentType, SeverityLevel


def test_river_environment_specification() -> None:
    river = RiverEnvironment()
    assert river.environment_id == EnvironmentType.RIVER
    assert river.is_primary is True
    assert "River" in river.display_name

    # Check key detection types
    pt_ids = [pt.problem_type_id for pt in river.supported_problem_types]
    assert "potential_riverbank_erosion" in pt_ids
    assert "significant_water_area_change" in pt_ids
    assert "exposed_riverbed" in pt_ids
    assert "potential_sediment_related_change" in pt_ids
    assert "riverbank_movement" in pt_ids

    # Scientific caution check: verify no absolute certainty words
    for pt in river.supported_problem_types:
        assert "disaster" not in pt.display_name.lower()
        assert "definitely" not in pt.display_name.lower()

    # Verify guided questions
    assert len(river.guided_questions) >= 3
    q_ids = [q.id for q in river.guided_questions]
    assert "river_basin_name" in q_ids


def test_landslide_environment_specification() -> None:
    landslide = LandslideEnvironment()
    assert landslide.environment_id == EnvironmentType.LANDSLIDE
    assert landslide.is_primary is False
    assert "Landslide" in landslide.display_name

    # Check key detection types
    pt_ids = [pt.problem_type_id for pt in landslide.supported_problem_types]
    assert "potential_landslide_related_change" in pt_ids
    assert "terrain_disturbance" in pt_ids
    assert "vegetation_loss" in pt_ids
    assert "exposed_ground" in pt_ids

    # Verify caution terminology
    for pt in landslide.supported_problem_types:
        assert "certain" not in pt.display_name.lower()


def test_environment_registry_lookups() -> None:
    registry = EnvironmentRegistry()
    assert registry.has_environment("river") is True
    assert registry.has_environment("landslide") is True
    assert registry.has_environment("unknown_env") is False

    river = registry.get("river")
    assert river is not None
    assert river.is_primary is True

    envs = registry.list_all()
    assert len(envs) >= 2
    # Primary environment should be listed first
    assert envs[0].is_primary is True


def test_custom_environment_extensibility() -> None:
    """Verifies that future environments (e.g. Forest, Coastline) can be added cleanly."""
    class ForestEnvironment(BaseEnvironment):
        @property
        def environment_id(self) -> EnvironmentType:
            return EnvironmentType.FOREST

        @property
        def display_name(self) -> str:
            return "Forest Canopy & Protected Woodland"

        @property
        def description(self) -> str:
            return "Monitors deforestation, canopy thinning, and illegal forest logging."

        @property
        def is_primary(self) -> bool:
            return False

        @property
        def supported_problem_types(self) -> list[ProblemTypeDefinition]:
            return [
                ProblemTypeDefinition(
                    problem_type_id="potential_deforestation",
                    display_name="Potential Canopy Depletion",
                    description="Abrupt reduction in continuous tree canopy cover.",
                    default_severity=SeverityLevel.HIGH,
                    recommended_action="Notify Forest Range Officer for on-site boundary audit.",
                )
            ]

        @property
        def guided_questions(self) -> list:
            return []

        @property
        def validation_rules(self) -> list:
            return []

    registry = EnvironmentRegistry()
    registry.register(ForestEnvironment())
    assert registry.has_environment("forest") is True
    forest = registry.get("forest")
    assert forest is not None
    assert forest.display_name == "Forest Canopy & Protected Woodland"
