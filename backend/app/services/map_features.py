"""Map-ready feature conversion for the Phase 6 monitoring map.

This service intentionally keeps the domain layer separate from the map renderer.
It converts actual analysis detections into GeoJSON-like features when data exists,
and returns a professional empty state when no geographic observations are available.
"""

from __future__ import annotations

from typing import Any


def _demo_features() -> list[dict[str, Any]]:
    """Prepared demonstration dataset explicitly labeled as demo data."""
    return [
        {
            "id": "demo-river-1",
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [76.2711, 10.0159],
            },
            "properties": {
                "environment": "river",
                "environment_name": "River Basin",
                "problem_type": "Potential Riverbank Erosion",
                "investigation_priority": "high",
                "confidence": 0.82,
                "change_percentage": 14.6,
                "analysis_id": "ANL-DEMO-001",
                "analysis_title": "Periyar River Reach Review",
                "evidence": [
                    "Significant changed region near the river margin.",
                    "Boundary-aligned change pattern consistent with bank movement.",
                    "Visual evidence is concentrated along the active channel edge.",
                ],
                "recommendation": "Field verification recommended.",
            },
        },
        {
            "id": "demo-landslide-1",
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [76.6532, 11.1316],
                    [76.6604, 11.1321],
                    [76.6608, 11.1389],
                    [76.6541, 11.1409],
                    [76.6532, 11.1316],
                ]],
            },
            "properties": {
                "environment": "landslide",
                "environment_name": "Landslide Risk Corridor",
                "problem_type": "Potential Landslide-related Change",
                "investigation_priority": "moderate",
                "confidence": 0.71,
                "change_percentage": 9.3,
                "analysis_id": "ANL-DEMO-002",
                "analysis_title": "Wayanad Escarpment Review",
                "evidence": [
                    "Coherent terrain disturbance concentrated in a slope-dominant sector.",
                    "Change pattern includes exposed ground and disturbed vegetation cover.",
                    "Observed geometry aligns with a likely slope instability signal.",
                ],
                "recommendation": "Geotechnical review recommended.",
            },
        },
    ]


def _citizen_report_features() -> list[dict[str, Any]]:
    """Citizen submissions are separated from AI detection results and shown as a different layer."""
    return [
        {
            "id": "citizen-river-1",
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [76.315, 10.085],
            },
            "properties": {
                "environment": "river",
                "environment_name": "River Basin",
                "problem_type": "Citizen Observation",
                "investigation_priority": "low",
                "confidence": 0.0,
                "change_percentage": 0,
                "analysis_id": None,
                "analysis_title": "Citizen report",
                "evidence": ["Citizen-submitted location and photo review pending officer inspection."],
                "recommendation": "Await officer review.",
                "feature_type": "citizen_report",
                "status": "new",
            },
        }
    ]


def build_map_feature_collection(
    *,
    mode: str = "empty",
    environment: str | None = None,
    priority: str | None = None,
    problem_type: str | None = None,
) -> dict[str, Any]:
    """Return map-ready GeoJSON-like features or a professional empty state."""
    mode_value = (mode or "empty").lower()
    if mode_value != "demo":
        return {
            "state": "empty",
            "message": "No monitored areas yet. Complete an analysis to begin monitoring environmental changes.",
            "demo_mode": False,
            "features": [],
        }

    features = _demo_features() + _citizen_report_features()

    if environment and environment.lower() != "all":
        features = [
            feature for feature in features if feature["properties"]["environment"].lower() == environment.lower()
        ]

    if priority and priority.lower() != "all":
        features = [
            feature for feature in features if feature["properties"]["investigation_priority"].lower() == priority.lower()
        ]

    if problem_type and problem_type.lower() != "all":
        features = [
            feature for feature in features if feature["properties"]["problem_type"].lower() == problem_type.lower()
        ]

    if not features:
        return {
            "state": "empty",
            "message": "Demo data loaded, but no features matched the selected filters.",
            "demo_mode": True,
            "features": [],
        }

    return {
        "state": "ready",
        "message": "Demo data",
        "demo_mode": True,
        "features": features,
    }
