"""Image analysis endpoints for Phase 4 visual change detection, Phase 5 interpretation, and Phase 7 review/reporting."""

from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.models.domain import ReviewDecision
from app.services.analysis_review import (
    generate_analysis_report,
    get_analysis_detail,
    submit_detection_review,
)
from app.services.environment_interpretation import interpret_change_result
from app.services.image_processing import process_image_pair

router = APIRouter()


class InterpretationRequest(BaseModel):
    analysis_id: str
    environment_type: str
    change_result: dict[str, Any] = {}
    context: dict[str, Any] = {}


class ReviewSubmissionRequest(BaseModel):
    decision: ReviewDecision
    comment: str = ""
    reviewer_id: str = "officer-001"


@router.get("/{analysis_id}")
def get_analysis(analysis_id: str) -> dict:
    """Return the full analysis detail view used by the Area Report."""
    try:
        return get_analysis_detail(analysis_id)
    except KeyError as exc:
        if str(exc) == "analysis_not_found":
            raise HTTPException(status_code=404, detail="Analysis not found.") from exc
        raise HTTPException(status_code=404, detail="Analysis not found.") from exc


@router.post("/{analysis_id}/detections/{detection_id}/review")
def submit_analysis_review(analysis_id: str, detection_id: str, payload: ReviewSubmissionRequest) -> dict:
    """Persist a human review decision for a detection."""
    try:
        return submit_detection_review(
            analysis_id=analysis_id,
            detection_id=detection_id,
            decision=payload.decision.value,
            comment=payload.comment,
            reviewer_id=payload.reviewer_id,
        )
    except KeyError as exc:
        if str(exc) == "analysis_not_found":
            raise HTTPException(status_code=404, detail="Analysis not found.") from exc
        raise HTTPException(status_code=404, detail="Finding not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{analysis_id}/report")
def generate_report(analysis_id: str) -> dict:
    """Generate a report from actual analysis and review data."""
    try:
        return generate_analysis_report(analysis_id)
    except KeyError as exc:
        if str(exc) == "analysis_not_found":
            raise HTTPException(status_code=404, detail="Analysis not found.") from exc
        raise HTTPException(status_code=404, detail="Analysis not found.") from exc


@router.post("/process")
async def process_analysis(
    before_image: UploadFile = File(..., description="Before-image observation for comparison."),
    after_image: UploadFile = File(..., description="After-image observation for comparison."),
) -> dict:
    """Run the generic change-detection pipeline on a before/after image pair."""
    if not before_image.filename or not after_image.filename:
        raise HTTPException(status_code=400, detail="Both before and after images are required.")

    try:
        before_bytes = await before_image.read()
        after_bytes = await after_image.read()
        result = process_image_pair(
            before_bytes=before_bytes,
            after_bytes=after_bytes,
            analysis_id=f"analysis_{before_image.filename}_{after_image.filename}",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive fallback for unexpected pipeline failures
        raise HTTPException(status_code=500, detail=f"Image processing failed: {exc}") from exc

    return result


@router.post("/interpret")
async def interpret_analysis(payload: InterpretationRequest) -> dict:
    """Translate Phase 4 change metrics into cautious environmental problem candidates."""
    if not payload.analysis_id:
        raise HTTPException(status_code=400, detail="An analysis_id is required for interpretation.")

    if payload.environment_type not in {"river", "landslide"}:
        return interpret_change_result("unknown", payload.change_result, payload.context)

    return interpret_change_result(payload.environment_type, payload.change_result, payload.context)
