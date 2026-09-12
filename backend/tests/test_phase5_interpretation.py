"""Tests for the Phase 5 environmental interpretation layer."""

from app.services.environment_interpretation import interpret_change_result


def test_riverbank_erosion_candidate() -> None:
    result = {
        "analysis_id": "analysis-river-1",
        "status": "completed",
        "change_percentage": 8.4,
        "detected_pixels": 25000,
        "features": {
            "alignment_quality": "good",
            "water_like_region_ratio": 0.42,
            "boundary_adjacent_ratio": 0.76,
            "region_count": 1,
            "change_intensity": 0.78,
        },
    }

    payload = interpret_change_result("river", result, {"recent_precipitation_event": "No - Normal Flow"})

    assert payload["detections"]
    assert any("Potential Riverbank Erosion" in detection["problem_type"] for detection in payload["detections"])
    assert payload["detections"][0]["confidence"] >= 0.4
    assert payload["detections"][0]["confidence_label"]


def test_water_area_change_candidate() -> None:
    result = {
        "analysis_id": "analysis-water-1",
        "status": "completed",
        "change_percentage": 12.1,
        "detected_pixels": 37000,
        "features": {
            "alignment_quality": "good",
            "water_like_region_ratio": 0.6,
            "water_like_change": 0.34,
            "region_count": 2,
            "change_intensity": 0.82,
        },
    }

    payload = interpret_change_result("river", result, {})

    assert any("Water-Area Change" in detection["problem_type"] or "Water-Area" in detection["problem_type"] for detection in payload["detections"])


def test_ambiguous_change_returns_uncertainty() -> None:
    result = {
        "analysis_id": "analysis-uncertain",
        "status": "completed",
        "change_percentage": 1.1,
        "detected_pixels": 1800,
        "features": {
            "alignment_quality": "poor",
            "water_like_region_ratio": 0.05,
            "boundary_adjacent_ratio": 0.12,
            "change_intensity": 0.22,
            "region_count": 1,
        },
    }

    payload = interpret_change_result("river", result, {})

    assert any("uncertain" in detection["problem_type"].lower() for detection in payload["detections"])
    assert payload["detections"][0]["confidence"] < 0.45


def test_landslide_related_change_candidate() -> None:
    result = {
        "analysis_id": "analysis-landslide-1",
        "status": "completed",
        "change_percentage": 9.7,
        "detected_pixels": 29000,
        "features": {
            "alignment_quality": "good",
            "vegetation_like_ratio": 0.34,
            "vegetation_loss": 0.42,
            "exposed_ground_ratio": 0.31,
            "region_count": 1,
            "change_intensity": 0.8,
        },
    }

    payload = interpret_change_result("landslide", result, {"slope_angle_estimate": "Steep (> 35°)"})

    assert any("Landslide" in detection["problem_type"] for detection in payload["detections"])
    assert payload["detections"][0]["investigation_priority"]
