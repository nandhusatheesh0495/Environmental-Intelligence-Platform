"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Environmental Intelligence Platform" in data["service"]


def test_system_status() -> None:
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["human_in_the_loop_enforced"] is True
    assert data["active_environments_count"] >= 2
    assert any(env["id"] == "river" for env in data["registered_environments"])


def test_list_environments() -> None:
    response = client.get("/api/v1/environments")
    assert response.status_code == 200
    envs = response.json()
    assert len(envs) >= 2
    # Ensure River is first
    assert envs[0]["environment_id"] == "river"
    assert envs[0]["is_primary"] is True


def test_get_specific_environment() -> None:
    response = client.get("/api/v1/environments/river")
    assert response.status_code == 200
    river = response.json()
    assert river["environment_id"] == "river"
    assert len(river["supported_problem_types"]) >= 5

    # Non-existent environment returns 404
    missing_resp = client.get("/api/v1/environments/volcano")
    assert missing_resp.status_code == 404


def test_analysis_detail_endpoint_returns_detection_summary() -> None:
    response = client.get("/api/v1/analysis/ANL-2026-089")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "ANL-2026-089"
    assert data["environment_type"] == "river"
    assert len(data["detections"]) >= 2
    assert data["detections"][0]["problem_type"] == "Potential Riverbank Erosion"


def test_review_submission_endpoint_accepts_valid_decisions() -> None:
    payload = {"decision": "confirmed", "comment": "Field inspection supports the finding."}
    response = client.post("/api/v1/analysis/ANL-2026-089/detections/det-river-1/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "confirmed"
    assert data["reviewer_id"] == "officer-001"


def test_review_submission_endpoint_rejects_invalid_decision() -> None:
    payload = {"decision": "not-valid", "comment": "This should fail."}
    response = client.post("/api/v1/analysis/ANL-2026-089/detections/det-river-1/review", json=payload)
    assert response.status_code == 422


def test_report_generation_uses_analysis_data_and_pending_review_state() -> None:
    response = client.post("/api/v1/analysis/ANL-2026-089/report")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["analysis_id"] == "ANL-2026-089"
    assert data["report"]["area_name"] == "Periyar Lower Reach Sector 4"
    assert "Potential Riverbank Erosion" in data["report"]["detections_summary"]
    assert "Pending Human Review" in data["report"]["review_summary"]


def test_create_citizen_report_and_list_it() -> None:
    png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 20
    response = client.post(
        "/api/v1/citizen-reports",
        data={
            "environment_type": "river",
            "location": "Bridge Pier 4, Aluva",
            "description": "Soil collapse observed after heavy rain.",
            "latitude": "10.085",
            "longitude": "76.315",
            "reporter_name": "Citizen Reporter",
            "reporter_contact": "citizen@example.com",
        },
        files={"image": ("report.png", png, "image/png")},
    )
    assert response.status_code == 200, response.text
    created = response.json()
    assert created["status"] == "new"
    assert created["environment_type"] == "river"

    list_response = client.get("/api/v1/citizen-reports")
    assert list_response.status_code == 200
    reports = list_response.json()
    assert any(item["id"] == created["id"] for item in reports)

    detail_response = client.get(f"/api/v1/citizen-reports/{created['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["description"] == "Soil collapse observed after heavy rain."


def test_update_citizen_report_status_validates_transitions() -> None:
    report = client.post(
        "/api/v1/citizen-reports",
        data={
            "environment_type": "landslide",
            "location": "Hill Road, Idukki",
            "description": "Loose soil and crack visible on slope.",
            "latitude": "9.85",
            "longitude": "77.12",
        },
        files={"image": ("slope.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * 20, "image/png")},
    ).json()

    update = client.post(f"/api/v1/citizen-reports/{report['id']}/status", json={"status": "under_review"})
    assert update.status_code == 200
    assert update.json()["status"] == "under_review"

    invalid = client.post(f"/api/v1/citizen-reports/{report['id']}/status", json={"status": "resolved"})
    assert invalid.status_code == 400
