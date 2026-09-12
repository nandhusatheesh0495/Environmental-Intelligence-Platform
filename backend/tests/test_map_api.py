from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_map_features_empty_state() -> None:
    response = client.get("/api/v1/map/features")
    assert response.status_code == 200
    payload = response.json()
    assert payload["state"] == "empty"
    assert payload["features"] == []
    assert "No monitored areas yet" in payload["message"]


def test_map_features_demo_mode_returns_labelled_features() -> None:
    response = client.get("/api/v1/map/features?mode=demo")
    assert response.status_code == 200
    payload = response.json()
    assert payload["state"] == "ready"
    assert payload["demo_mode"] is True
    assert len(payload["features"]) >= 2
    assert payload["features"][0]["properties"]["problem_type"] == "Potential Riverbank Erosion"
