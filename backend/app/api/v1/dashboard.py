"""Dashboard operational summary and event stream endpoints."""

from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary() -> dict:
    """Return live operational metrics.
    
    Zero data fabrication policy: In the MVP before persistent database records exist,
    this accurately returns unpopulated/zero state instead of synthetic values.
    """
    return {
        "areas_monitored": 0,
        "analyses_count": 0,
        "changes_detected": 0,
        "high_priority_count": 0,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "status": "operational",
    }


@router.get("/activity")
def get_dashboard_activity() -> list[dict]:
    """Return operational event stream. Initially empty in fresh environment."""
    return []
