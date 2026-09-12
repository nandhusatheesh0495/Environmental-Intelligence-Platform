"""Image analysis endpoints for Phase 4 visual change detection."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.image_processing import process_image_pair

router = APIRouter()


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
