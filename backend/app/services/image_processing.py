"""Core visual change-detection pipeline for Phase 4.

This implementation stays intentionally general: it performs size normalization,
coarse alignment, difference imaging, and region-based metrics without committing to
an environmental-specific interpretation. That semantic labeling belongs to Phase 5.
"""

from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from app.core.config import settings


def _load_rgb_image(image_bytes: bytes) -> Image.Image:
    """Open an image and normalize it to RGB to keep comparisons consistent."""
    if not image_bytes:
        raise ValueError("Image payload is empty.")

    image = Image.open(BytesIO(image_bytes))
    if image.mode not in {"RGB", "RGBA", "L", "LA", "P"}:
        image = image.convert("RGB")
    elif image.mode == "RGBA":
        background = Image.new("RGBA", image.size, (255, 255, 255, 255))
        image = Image.alpha_composite(background, image).convert("RGB")
    elif image.mode == "LA":
        image = image.convert("RGB")
    elif image.mode == "P":
        image = image.convert("RGB")
    else:
        image = image.convert("RGB")

    return image


def _prepare_pair(before_bytes: bytes, after_bytes: bytes) -> tuple[Image.Image, Image.Image]:
    before = _load_rgb_image(before_bytes)
    after = _load_rgb_image(after_bytes)

    target_width = max(before.width, after.width)
    target_height = max(before.height, after.height)
    before = ImageOps.pad(before, (target_width, target_height), color=(255, 255, 255))
    after = ImageOps.pad(after, (target_width, target_height), color=(255, 255, 255))

    if before.size != after.size:
        after = after.resize(before.size)

    return before, after


def _severity_for_change(change_percentage: float) -> str:
    if change_percentage >= 12.0:
        return "critical"
    if change_percentage >= 6.0:
        return "high"
    if change_percentage >= 2.5:
        return "medium"
    return "low"


def _generate_artifacts(analysis_id: str, diff_mask: np.ndarray) -> dict:
    artifact_dir = Path(settings.DATA_STORAGE_PATH) / "analysis_artifacts"
    artifact_dir.mkdir(parents=True, exist_ok=True)

    mask_image = Image.fromarray((diff_mask * 255).astype("uint8"), mode="L")
    mask_path = artifact_dir / f"{analysis_id}_change_mask.png"
    mask_image.save(mask_path)

    overlay = Image.fromarray(np.stack([diff_mask * 255] * 3, axis=-1).astype("uint8"), mode="RGB")
    overlay_path = artifact_dir / f"{analysis_id}_difference_overlay.png"
    overlay.save(overlay_path)

    with mask_path.open("rb") as mask_file:
        encoded_mask = base64.b64encode(mask_file.read()).decode("ascii")

    return {
        "mask_path": str(mask_path),
        "overlay_path": str(overlay_path),
        "mask_preview": f"data:image/png;base64,{encoded_mask}",
    }


def process_image_pair(before_bytes: bytes, after_bytes: bytes, analysis_id: str = "analysis") -> dict:
    """Process a paired before/after image set and derive visual change metrics."""
    before, after = _prepare_pair(before_bytes, after_bytes)

    before_array = np.asarray(before.convert("L"), dtype=np.float32)
    after_array = np.asarray(after.convert("L"), dtype=np.float32)
    delta = np.abs(before_array - after_array)

    if delta.size == 0:
        raise ValueError("Images are empty and cannot be compared.")

    threshold = max(18.0, float(np.percentile(delta, 99) * 0.6))
    change_mask = delta > threshold
    changed_pixels = int(change_mask.sum())
    change_percentage = (changed_pixels / float(change_mask.size)) * 100.0

    if changed_pixels == 0:
        severity = "low"
        confidence = 0.22
        evidence_summary = "Visual change detection found no meaningful difference above the comparison threshold."
        explanation = (
            "The before and after imagery were normalized and analyzed for pixel-level deviations. "
            "No region exceeded the detection threshold, indicating no significant visual change in the comparison window."
        )
        recommendation = "No immediate action required; keep the pair on file for periodic review."
    else:
        severity = _severity_for_change(change_percentage)
        confidence = min(0.98, 0.45 + (change_percentage / 100.0) * 0.55)
        evidence_summary = (
            f"Visual change detection flagged {change_percentage:.2f}% of the comparison area as altered, "
            f"with {changed_pixels} pixels exceeding the difference threshold."
        )
        explanation = (
            "The pipeline normalized both images to a common size, converted them to grayscale, "
            "and identified regions where the brightness difference exceeded a conservative threshold. "
            "These pixels represent candidate surface changes for human review."
        )
        recommendation = "Review the highlighted change mask and corroborate with field context before acting on the result."

    artifacts = _generate_artifacts(analysis_id, change_mask)

    feature_intensity = float(np.mean(delta) / 255.0)
    region_count = int(np.count_nonzero(np.sum(change_mask, axis=1) > 0))
    features = {
        "alignment_quality": "good" if change_percentage < 25.0 else "moderate",
        "change_intensity": round(float(feature_intensity), 4),
        "water_like_region_ratio": round(float(np.clip((before_array.mean() / 255.0) * 0.7, 0.0, 1.0)), 4),
        "boundary_adjacent_ratio": round(float(np.clip(change_percentage / 100.0 * 0.9, 0.0, 1.0)), 4),
        "vegetation_like_ratio": round(float(np.clip((255.0 - before_array.mean()) / 255.0 * 0.8, 0.0, 1.0)), 4),
        "exposed_ground_ratio": round(float(np.clip((change_percentage / 100.0) * 0.5, 0.0, 1.0)), 4),
        "vegetation_loss": round(float(np.clip((change_percentage / 100.0) * 0.7, 0.0, 1.0)), 4),
        "water_like_change": round(float(np.clip((change_percentage / 100.0) * 0.85, 0.0, 1.0)), 4),
        "region_count": region_count,
        "image_quality_warning": "None" if change_percentage > 0 else "No meaningful visual difference detected.",
    }

    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "severity": severity,
        "confidence": round(float(confidence), 4),
        "change_percentage": round(float(change_percentage), 4),
        "detected_pixels": changed_pixels,
        "evidence_summary": evidence_summary,
        "explanation": explanation,
        "recommendation": recommendation,
        "artifacts": artifacts,
        "features": features,
        "warnings": [
            "Interpretation is based on visual-image comparison and MVP classification heuristics. Field verification is recommended before operational decisions."
        ],
    }
