"""Phase 7 in-memory analysis detail, review, and report-building service.

This service intentionally keeps the human review flow lightweight and evidence-based.
It stores review state in-memory for the current process and generates a report from the
same underlying analysis data used in the UI.
"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

_EXAMPLE_ANALYSES: dict[str, dict[str, Any]] = {
    "ANL-2026-089": {
        "id": "ANL-2026-089",
        "area_id": "area-periyar-01",
        "area_name": "Periyar Lower Reach Sector 4",
        "location": "Periyar Lower Reach, Kerala",
        "environment_type": "river",
        "environment_name": "River Basin",
        "analysis_status": "completed",
        "before_image": {
            "date": "2026-08-15T00:00:00Z",
            "source": "Sentinel-2 scene",
            "url": "",
        },
        "after_image": {
            "date": "2026-09-12T00:00:00Z",
            "source": "Sentinel-2 scene",
            "url": "",
        },
        "created_at": "2026-09-12T14:00:00Z",
        "analysis_date": "2026-09-12T14:00:00Z",
        "imagery_source": "Sentinel-2 / local archive",
        "detections": [
            {
                "id": "det-river-1",
                "analysis_id": "ANL-2026-089",
                "problem_type": "Potential Riverbank Erosion",
                "severity": "high",
                "confidence": 0.82,
                "confidence_label": "High confidence",
                "investigation_priority": "high",
                "change_percentage": 14.6,
                "geometry": {"type": "Polygon", "coordinates": [[[76.27, 10.01], [76.29, 10.01], [76.29, 10.02], [76.27, 10.02], [76.27, 10.01]]]},
                "evidence_summary": "Significant changed region near the river margin.",
                "explanation": "The visual change is concentrated along the active riverbank edge and is consistent with bank displacement or scour-related movement.",
                "recommendation": "Field verification recommended.",
                "evidence": [
                    "Significant changed region near the river margin.",
                    "The boundary-aligned pattern is consistent with riverbank movement.",
                    "The detected region is spatially coherent and concentrated on the active bank edge.",
                ],
                "review_status": "pending",
                "review_comment": "",
                "reviewer_id": "",
            },
            {
                "id": "det-river-2",
                "analysis_id": "ANL-2026-089",
                "problem_type": "Significant Water-Area Change",
                "severity": "medium",
                "confidence": 0.74,
                "confidence_label": "High confidence",
                "investigation_priority": "moderate",
                "change_percentage": 9.8,
                "geometry": {"type": "Polygon", "coordinates": [[[76.275, 10.016], [76.285, 10.016], [76.285, 10.022], [76.275, 10.022], [76.275, 10.016]]]},
                "evidence_summary": "Hydrologic change is visible in the channel footprint.",
                "explanation": "The observed variation is concentrated in the water-bearing portion of the scene and is consistent with a water-area change rather than a purely bank-only movement.",
                "recommendation": "Review seasonal conditions and field observations before drawing conclusions.",
                "evidence": [
                    "The change is primarily located within the active channel footprint.",
                    "The region has a coherent water-dominant signal across multiple pixels.",
                    "The pattern is consistent with seasonal or flow-related change rather than a confirmed hazard.",
                ],
                "review_status": "pending",
                "review_comment": "",
                "reviewer_id": "",
            },
        ],
        "quality_notes": [
            "Observed change: 14.6%",
            "Alignment quality: good",
            "No major image-quality or sensor artifacts detected.",
        ],
        "reporting": {
            "status": "ready",
        },
    }
}

_REVIEW_STORE: dict[str, dict[str, Any]] = {}


def _clone_analysis(analysis_id: str) -> dict[str, Any]:
    analysis = deepcopy(_EXAMPLE_ANALYSES.get(analysis_id))
    if analysis is None:
        raise KeyError("analysis_not_found")

    detection_reviews = _REVIEW_STORE.get(analysis_id, {})
    for detection in analysis["detections"]:
        review = detection_reviews.get(detection["id"])
        if review:
            detection["review_status"] = review["decision"]
            detection["review_comment"] = review["comment"]
            detection["reviewer_id"] = review["reviewer_id"]
        else:
            detection["review_status"] = "pending"
            detection["review_comment"] = ""
            detection["reviewer_id"] = ""
    return analysis


def get_analysis_detail(analysis_id: str) -> dict[str, Any]:
    """Return a single analysis with detections, review state, and evidence."""
    return _clone_analysis(analysis_id)


def submit_detection_review(
    *,
    analysis_id: str,
    detection_id: str,
    decision: str,
    comment: str,
    reviewer_id: str = "officer-001",
) -> dict[str, Any]:
    """Persist a human-in-the-loop decision for a detection."""
    analysis = _clone_analysis(analysis_id)
    detection = next((item for item in analysis["detections"] if item["id"] == detection_id), None)
    if detection is None:
        raise KeyError("detection_not_found")

    normalized = decision.lower()
    valid = {"confirmed", "rejected", "inconclusive"}
    if normalized not in valid:
        raise ValueError("invalid_decision")

    review_record = {
        "id": f"rev-{detection_id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "analysis_id": analysis_id,
        "detection_id": detection_id,
        "reviewer_id": reviewer_id,
        "decision": normalized,
        "comment": comment or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _REVIEW_STORE.setdefault(analysis_id, {})[detection_id] = review_record
    detection["review_status"] = normalized
    detection["review_comment"] = comment or ""
    detection["reviewer_id"] = reviewer_id
    return review_record


def generate_analysis_report(analysis_id: str) -> dict[str, Any]:
    """Generate a report payload from actual analysis and review state."""
    analysis = _clone_analysis(analysis_id)
    detections = analysis["detections"]
    pending_count = sum(1 for item in detections if item["review_status"] == "pending")
    if pending_count:
        review_summary = "Pending Human Review"
    else:
        latest = sorted(
            (
                _REVIEW_STORE.get(analysis_id, {}).get(item["id"], {})
                for item in detections
            ),
            key=lambda item: item.get("created_at", ""),
            reverse=True,
        )
        decision = latest[0].get("decision", "pending") if latest else "pending"
        review_summary = f"Human Review: {decision.title()}"

    report = {
        "area_name": analysis["area_name"],
        "environment": analysis["environment_name"],
        "report_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "analysis_id": analysis_id,
        "analysis_date": analysis.get("analysis_date"),
        "before_image_date": analysis["before_image"]["date"],
        "after_image_date": analysis["after_image"]["date"],
        "imagery_source": analysis["imagery_source"],
        "detection_count": len(detections),
        "detections_summary": ", ".join(item["problem_type"] for item in detections),
        "review_summary": review_summary,
        "quality_notes": analysis.get("quality_notes", []),
        "detections": [
            {
                "problem_type": item["problem_type"],
                "confidence": item["confidence"],
                "investigation_priority": item["investigation_priority"],
                "evidence": item["evidence"],
                "recommendation": item["recommendation"],
                "review_status": item["review_status"],
            }
            for item in detections
        ],
    }
    return {"status": "ready", "analysis_id": analysis_id, "report": report}
