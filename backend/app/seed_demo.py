"""Seed a deterministic, small demo dataset for the platform."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEMO_ROOT = ROOT / "demo"


def _write_demo_case(name: str, *, env: str, location: str, before_date: str, after_date: str) -> dict[str, Any]:
    case_dir = DEMO_ROOT / env / name
    case_dir.mkdir(parents=True, exist_ok=True)

    before_path = case_dir / "before.png"
    after_path = case_dir / "after.png"

    before = Image.new("RGB", (720, 480), color=(186, 220, 240))
    draw = ImageDraw.Draw(before)
    draw.rectangle((0, 300, 720, 480), fill=(90, 150, 75))
    draw.rectangle((150, 180, 470, 260), fill=(138, 86, 52))
    draw.rectangle((470, 180, 560, 260), fill=(230, 202, 164))
    draw.line((0, 300, 720, 300), fill=(40, 120, 170), width=8)
    before.save(before_path)

    after = Image.new("RGB", (720, 480), color=(186, 220, 240))
    draw = ImageDraw.Draw(after)
    draw.rectangle((0, 300, 720, 480), fill=(90, 150, 75))
    draw.rectangle((170, 210, 520, 290), fill=(138, 86, 52))
    draw.rectangle((520, 210, 610, 290), fill=(230, 202, 164))
    draw.line((0, 330, 720, 330), fill=(40, 120, 170), width=10)
    if env == "river":
        draw.rectangle((300, 260, 480, 320), fill=(92, 103, 111))
    if env == "landslide":
        draw.rectangle((350, 130, 600, 330), fill=(112, 88, 72))
        for i in range(6):
            draw.polygon([(80 + i * 80, 240), (120 + i * 80, 150), (160 + i * 80, 240)], fill=(118, 136, 100))
    after.save(after_path)

    metadata = {
        "case_id": name,
        "environment": env,
        "location": location,
        "before_date": before_date,
        "after_date": after_date,
        "before_image": str(before_path),
        "after_image": str(after_path),
        "description": f"Demo case for {env} monitoring workflow.",
        "expected_detection": "Potential change identified in the active channel or slope sector.",
        "expected_priority": "high" if env == "river" else "moderate",
    }
    (case_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    return {
        "id": name,
        "environment": env,
        "location": location,
        "before_date": before_date,
        "after_date": after_date,
        "before_image": str(before_path),
        "after_image": str(after_path),
        "metadata_path": str(case_dir / "metadata.json"),
    }


def seed_demo(*, reset: bool = False) -> dict[str, Any]:
    """Create or refresh the curated demo dataset and manifest."""
    if reset and DEMO_ROOT.exists():
        for child in DEMO_ROOT.iterdir():
            if child.is_dir():
                for nested in child.iterdir():
                    if nested.is_file():
                        nested.unlink()
                for nested in list(child.iterdir()):
                    if nested.is_dir():
                        for file in nested.iterdir():
                            if file.is_file():
                                file.unlink()
                        nested.rmdir()
                child.rmdir()

    DEMO_ROOT.mkdir(parents=True, exist_ok=True)

    cases = [
        _write_demo_case(
            "river-corridor",
            env="river",
            location="Periyar Lower Reach, Kerala",
            before_date="2026-08-15",
            after_date="2026-09-12",
        ),
        _write_demo_case(
            "landslide-slope",
            env="landslide",
            location="Wayanad Escarpment, Kerala",
            before_date="2026-08-05",
            after_date="2026-09-10",
        ),
    ]

    manifest = {
        "$schema": "demo-manifest-v1",
        "generated_by": "app.seed_demo",
        "cases": cases,
    }
    manifest_path = DEMO_ROOT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    return {
        "status": "seeded",
        "manifest_path": str(manifest_path),
        "cases": cases,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create the small deterministic demo dataset for the Environmental Intelligence Platform.")
    parser.add_argument("--reset", action="store_true", help="Remove the existing demo assets before re-seeding.")
    args = parser.parse_args()
    result = seed_demo(reset=args.reset)
    print(json.dumps(result, indent=2))
