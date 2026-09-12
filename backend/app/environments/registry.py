"""Central Environment Registry.

Decouples environment domain logic from common analysis, reporting, and detection infrastructure.
New environments (Forest, Coastline, Wetland, etc.) register here without modifying core pipelines.
"""

from typing import Optional
from app.environments.base import BaseEnvironment
from app.environments.river import RiverEnvironment
from app.environments.landslide import LandslideEnvironment
from app.models.domain import EnvironmentType


class EnvironmentRegistry:
    def __init__(self) -> None:
        self._registry: dict[EnvironmentType, BaseEnvironment] = {}
        # Auto-register MVP environments
        self.register(RiverEnvironment())
        self.register(LandslideEnvironment())

    def register(self, environment: BaseEnvironment) -> None:
        """Register a new environment handler."""
        self._registry[environment.environment_id] = environment

    def get(self, env_id: EnvironmentType | str) -> Optional[BaseEnvironment]:
        """Retrieve an environment by its identifier or enum."""
        if isinstance(env_id, str):
            try:
                env_id = EnvironmentType(env_id.lower())
            except ValueError:
                return None
        return self._registry.get(env_id)

    def list_all(self) -> list[BaseEnvironment]:
        """List all active registered environments, primary first."""
        envs = list(self._registry.values())
        return sorted(envs, key=lambda e: (not e.is_primary, e.display_name))

    def has_environment(self, env_id: EnvironmentType | str) -> bool:
        return self.get(env_id) is not None


# Global registry singleton
environment_registry = EnvironmentRegistry()
