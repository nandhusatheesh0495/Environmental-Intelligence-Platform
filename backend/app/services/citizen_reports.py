"""In-memory citizen reporting service for Phase 8.

This workflow intentionally remains separate from the Phase 4/5 AI analysis stack.
Citizen reports are stored as operational observations for officer review only.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any

from fastapi import UploadFile
from PIL import Image

from app.core.config import settings
from app.models.domain import CitizenReport, ReportStatus

_STORAGE_DIR = Path(settings.DATA_STORAGE_PATH) / "citizen_reports"
_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

_CITIZEN_REPORTS: dict[str, dict[str, Any]] = {}
_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024
_VALID_TRANSITIONS: dict[ReportStatus, set[ReportStatus]] = {
    ReportStatus.NEW: {ReportStatus.UNDER_REVIEW, ReportStatus.REJECTED},
    ReportStatus.SUBMITTED: {ReportStatus.UNDER_REVIEW, ReportStatus.REJECTED},
    ReportStatus.UNDER_REVIEW: {ReportStatus.REVIEWED, ReportStatus.REJECTED},
    ReportStatus.REVIEWED: {ReportStatus.RESOLVED, ReportStatus.REJECTED},
    ReportStatus.RESOLVED: set(),
    ReportStatus.REJECTED: set(),
    ReportStatus.VALIDATED: set(),
    ReportStatus.DISMISSED: set(),
}


def _safe_base_name(file_name: str) -> str:
    cleaned = os.path.basename(file_name or "report")
    stem = Path(cleaned).stem
    return (stem or "report").replace("/", "_").replace("\\", "_")


def _make_report_id() -> str:
    return f"CR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def _normalize_status(value: str | None) -> ReportStatus:
    if value is None:
        return ReportStatus.NEW
    normalized = str(value).strip().lower()
    for status in ReportStatus:
        if status.value == normalized:
            return status
    raise ValueError(f"Unsupported report status: {value}")


def _serialize_report(report: CitizenReport) -> dict[str, Any]:
    data = report.model_dump(mode="json")
    data["status"] = data["status"]
    return data


def _validate_image_bytes(image_bytes: bytes, filename: str | None) -> None:
    if not image_bytes:
        raise ValueError("Uploaded image is empty.")
    if len(image_bytes) > _MAX_IMAGE_BYTES:
        raise ValueError("Uploaded image exceeds the 5MB size limit.")

    suffix = Path(filename or "report.png").suffix.lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported image format. Use JPEG, PNG, or WebP.")

    signature_bytes = image_bytes[:12]
    png_signature = b"\x89PNG\r\n\x1a\n"
    jpeg_signature = b"\xff\xd8\xff"
    webp_signature = b"RIFF"

    is_png = signature_bytes.startswith(png_signature)
    is_jpeg = signature_bytes.startswith(jpeg_signature)
    is_webp = signature_bytes.startswith(webp_signature) and len(image_bytes) >= 12 and image_bytes[8:12] == b"WEBP"

    if not (is_png or is_jpeg or is_webp):
        raise ValueError("Uploaded image is not a valid image file.")


def _store_image(upload: UploadFile) -> str:
    if upload.filename is None:
        raise ValueError("An uploaded image is required.")

    upload.file.seek(0)
    image_bytes = upload.file.read() if upload.file else b""
    _validate_image_bytes(image_bytes, upload.filename)

    safe_name = f"{_make_report_id().lower()}_{_safe_base_name(upload.filename)}"
    suffix = Path(upload.filename).suffix.lower() or ".png"
    final_name = safe_name + suffix
    destination = _STORAGE_DIR / final_name

    with destination.open("wb") as handle:
        handle.write(image_bytes)

    return f"/api/v1/citizen-reports/images/{final_name}"


def list_citizen_reports(*, status: str | None = None, environment: str | None = None) -> list[dict[str, Any]]:
    filtered = list(_CITIZEN_REPORTS.values())
    if status:
        normalized = _normalize_status(status)
        filtered = [item for item in filtered if item["status"] == normalized.value]
    if environment:
        env = str(environment).strip().lower()
        filtered = [item for item in filtered if item["environment_type"] == env]
    filtered.sort(key=lambda item: item["submitted_at"], reverse=True)
    return [_serialize_report(CitizenReport(**item)) for item in filtered]


def create_citizen_report(
    *,
    environment_type: str,
    location: str,
    description: str,
    latitude: float | None,
    longitude: float | None,
    observation_date: str | None,
    reporter_name: str | None,
    reporter_contact: str | None,
    image: UploadFile,
) -> dict[str, Any]:
    image_path = _store_image(image)

    try:
        parsed_date = datetime.fromisoformat(observation_date) if observation_date else None
    except ValueError as exc:
        raise ValueError("Observation date must be a valid ISO-8601 timestamp.") from exc

    report = CitizenReport(
        id=_make_report_id(),
        environment_type=environment_type,
        location=location,
        description=description,
        image_path=image_path,
        latitude=latitude,
        longitude=longitude,
        observation_date=parsed_date,
        status=ReportStatus.NEW,
        reporter_name=reporter_name,
        reporter_contact=reporter_contact,
    )
    _CITIZEN_REPORTS[report.id] = report.model_dump(mode="json")
    return _serialize_report(report)


def get_citizen_report(report_id: str) -> dict[str, Any]:
    report_data = _CITIZEN_REPORTS.get(report_id)
    if report_data is None:
        raise KeyError("report_not_found")
    return _serialize_report(CitizenReport(**report_data))


def update_citizen_report_status(*, report_id: str, status: str, note: str | None = None) -> dict[str, Any]:
    report_data = _CITIZEN_REPORTS.get(report_id)
    if report_data is None:
        raise KeyError("report_not_found")

    current_status = _normalize_status(report_data["status"])
    next_status = _normalize_status(status)
    if next_status not in _VALID_TRANSITIONS.get(current_status, set()):
        raise ValueError(f"Invalid status transition: {current_status.value} -> {next_status.value}")

    report_data["status"] = next_status.value
    if note is not None:
        report_data["review_note"] = note.strip() or None
    report = CitizenReport(**report_data)
    _CITIZEN_REPORTS[report.id] = report.model_dump(mode="json")
    return _serialize_report(report)
