"""System operational and status endpoints."""

from fastapi import APIRouter
from app.core.config import settings
from app.environments.registry import environment_registry

router = APIRouter()


@router.get("/status")
def get_system_status() -> dict:
    """Return operational readiness, active environments, and governance settings."""
    envs = environment_registry.list_all()
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "human_in_the_loop_enforced": settings.HUMAN_IN_THE_LOOP_ENFORCED,
        "active_environments_count": len(envs),
        "primary_environment": next((e.display_name for e in envs if e.is_primary), "River Basin & Riparian Corridor"),
        "registered_environments": [
            {
                "id": e.environment_id.value,
                "name": e.display_name,
                "is_primary": e.is_primary,
                "detection_types_count": len(e.supported_problem_types),
            }
            for e in envs
        ],
    }
