"""Tests for the Phase 4 visual change-detection pipeline."""

from io import BytesIO

from PIL import Image

from app.main import app
from app.services.image_processing import process_image_pair
from fastapi.testclient import TestClient

client = TestClient(app)


def _make_png(color: tuple[int, int, int], size: tuple[int, int] = (200, 200)) -> bytes:
    image = Image.new("RGB", size, color)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_process_image_pair_identical_images() -> None:
    before = _make_png((50, 80, 120))
    after = _make_png((50, 80, 120))

    result = process_image_pair(before, after, analysis_id="analysis-identical")

    assert result["status"] == "completed"
    assert result["change_percentage"] < 1.0
    assert result["severity"] == "low"
    assert "visual change" in result["evidence_summary"].lower()


def test_process_image_pair_detects_change() -> None:
    before = _make_png((20, 30, 40))
    after = _make_png((20, 30, 40))
    after_image = Image.new("RGB", (200, 200), (20, 30, 40))
    for x in range(80, 140):
        for y in range(80, 140):
            after_image.putpixel((x, y), (220, 40, 40))
    after = BytesIO()
    after_image.save(after, format="PNG")

    result = process_image_pair(before, after.getvalue(), analysis_id="analysis-change")

    assert result["status"] == "completed"
    assert result["change_percentage"] > 0.0
    assert result["detected_pixels"] > 0
    assert "change" in result["explanation"].lower()


def test_process_analysis_endpoint() -> None:
    before = _make_png((10, 20, 30))
    after = _make_png((50, 60, 90))

    response = client.post(
        "/api/v1/analysis/process",
        files={
            "before_image": ("before.png", before, "image/png"),
            "after_image": ("after.png", after, "image/png"),
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "completed"
    assert payload["change_percentage"] >= 0.0
    assert "artifacts" in payload
