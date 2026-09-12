"""Environment registry and detection catalog API endpoints."""

from fastapi import APIRouter, HTTPException
from app.environments.registry import environment_registry

router = APIRouter()


@router.get("")
def list_environments() -> list[dict]:
    """Retrieve all supported environmental domains and their detection capabilities."""
    return [env.to_dict() for env in environment_registry.list_all()]


@router.get("/{env_id}")
def get_environment(env_id: str) -> dict:
    """Retrieve detailed specification, guided questions, and detection rules for an environment."""
    env = environment_registry.get(env_id)
    if not env:
        raise HTTPException(
            status_code=404,
            detail=f"Environment '{env_id}' is not registered in the platform.",
        )
    return env.to_dict()
