"""Integration tests for Dashboard API endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_dashboard_summary_empty_state() -> None:
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    # Verify zero data fabrication: counts start at 0
    assert data["areas_monitored"] == 0
    assert data["analyses_count"] == 0
    assert data["changes_detected"] == 0
    assert data["high_priority_count"] == 0
    assert "last_updated" in data


def test_dashboard_activity_empty_state() -> None:
    response = client.get("/api/v1/dashboard/activity")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0
