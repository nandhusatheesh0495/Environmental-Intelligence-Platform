from pathlib import Path

from app.seed_demo import seed_demo


def test_demo_seed_is_idempotent_and_creates_manifest() -> None:
    result = seed_demo(reset=True)
    assert result["status"] == "seeded"
    assert len(result["cases"]) == 2
    manifest_path = Path(result["manifest_path"])
    assert manifest_path.exists()

    second = seed_demo(reset=False)
    assert second["status"] == "seeded"
    assert second["cases"][0]["id"] == result["cases"][0]["id"]
    assert len(second["cases"]) == 2

    for case in result["cases"]:
        assert Path(case["before_image"]).exists()
        assert Path(case["after_image"]).exists()
