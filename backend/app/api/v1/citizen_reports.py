"""Citizen report endpoints for Phase 8."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.config import settings
from app.services.citizen_reports import (
    create_citizen_report,
    get_citizen_report,
    list_citizen_reports,
    update_citizen_report_status,
)

router = APIRouter()


@router.get("")
def get_reports(
    status: str | None = Query(default=None),
    environment: str | None = Query(default=None),
) -> list[dict]:
    """Return citizen observations for officer review."""
    return list_citizen_reports(status=status, environment=environment)


@router.post("")
async def create_report(
    environment_type: Annotated[str, Form(...)],
    location: Annotated[str, Form(...)],
    description: Annotated[str, Form(...)],
    latitude: Annotated[str | None, Form()] = None,
    longitude: Annotated[str | None, Form()] = None,
    observation_date: Annotated[str | None, Form()] = None,
    reporter_name: Annotated[str | None, Form()] = None,
    reporter_contact: Annotated[str | None, Form()] = None,
    image: Annotated[UploadFile | None, File()] = None,
) -> dict:
    """Create a citizen environmental report."""
    if image is None:
        raise HTTPException(status_code=400, detail="A valid image is required.")

    try:
        normalized_lat = float(latitude) if latitude not in (None, "") else None
        normalized_lon = float(longitude) if longitude not in (None, "") else None
        return create_citizen_report(
            environment_type=environment_type,
            location=location,
            description=description,
            latitude=normalized_lat,
            longitude=normalized_lon,
            observation_date=observation_date,
            reporter_name=reporter_name,
            reporter_contact=reporter_contact,
            image=image,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/images/{filename}")
def serve_report_image(filename: str) -> FileResponse:
    """Serve uploaded citizen photo evidence."""
    storage_path = Path(settings.DATA_STORAGE_PATH) / "citizen_reports" / filename
    if not storage_path.exists() or not storage_path.is_file():
        raise HTTPException(status_code=404, detail="Citizen report image not found.")
    return FileResponse(storage_path)


@router.get("/{report_id}")
def get_report(report_id: str) -> dict:
    """Return a citizen report detail view."""
    try:
        return get_citizen_report(report_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Citizen report not found.") from exc


@router.post("/{report_id}/status")
def update_report_status(report_id: str, payload: dict) -> dict:
    """Update the officer review status for a citizen observation."""
    status_value = payload.get("status")
    if not status_value:
        raise HTTPException(status_code=400, detail="A status value is required.")

    try:
        return update_citizen_report_status(report_id=report_id, status=str(status_value), note=payload.get("note"))
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Citizen report not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
