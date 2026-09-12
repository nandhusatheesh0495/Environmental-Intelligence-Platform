"""Map feature API for the Phase 6 monitoring map."""

from fastapi import APIRouter, Query

from app.services.map_features import build_map_feature_collection

router = APIRouter()


@router.get("/features")
def get_map_features(
    mode: str = Query(default="empty", description="Operational mode: empty or demo."),
    environment: str | None = Query(default=None, description="Filter by environment."),
    priority: str | None = Query(default=None, description="Filter by investigation priority."),
    problem_type: str | None = Query(default=None, description="Filter by problem type."),
) -> dict:
    """Return map-ready features for the monitoring map.

    The default state is empty to satisfy the repository's no-fabrication rule.
    Demo data is only returned when explicitly requested via mode=demo and is labeled
    as demonstration-only data in the payload.
    """
    return build_map_feature_collection(
        mode=mode,
        environment=environment,
        priority=priority,
        problem_type=problem_type,
    )
