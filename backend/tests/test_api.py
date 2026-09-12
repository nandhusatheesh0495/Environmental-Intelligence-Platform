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
