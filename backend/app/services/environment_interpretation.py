"""Phase 5 environmental interpretation layer.

This service consumes Phase 4 change-output features and translates them into
potential environmental problem candidates using deterministic, transparent rules.
The classification remains cautious and evidence-based; it does not claim disaster
probability or validated scientific truth.
"""

from __future__ import annotations

from typing import Any


CONFIDENCE_THRESHOLDS = {
    "high": 0.7,
    "moderate": 0.45,
    "low": 0.0,
}


def _confidence_label(confidence: float) -> str:
    if confidence >= CONFIDENCE_THRESHOLDS["high"]:
        return "High confidence"
    if confidence >= CONFIDENCE_THRESHOLDS["moderate"]:
        return "Moderate confidence"
    return "Low confidence"


def _priority_for(confidence: float, change_percentage: float, alignment_quality: str) -> str:
    score = confidence * 0.55 + (change_percentage / 100.0) * 0.35
    if alignment_quality == "poor":
        score *= 0.7
    if score >= 0.74:
        return "High"
    if score >= 0.4:
        return "Moderate"
    return "Low"


def _with_default_context(context: dict[str, Any]) -> dict[str, Any]:
    return {
        "recent_precipitation_event": "Unknown",
        "seasonal_flow_stage": "Unknown",
        "infrastructure_proximity": "Unknown",
        "slope_angle_estimate": "Unknown",
        "downslope_exposure": "Unknown",
        **context,
    }


def _build_detection(
    problem_type: str,
    confidence: float,
    evidence: list[str],
    explanation: str,
    recommendation: str,
    analysis_id: str,
    change_percentage: float,
    alignment_quality: str,
) -> dict[str, Any]:
    return {
        "id": f"det-{analysis_id}-{problem_type.lower().replace(' ', '-').replace('/', '-')}",
        "analysis_id": analysis_id,
        "environment_type": "river" if "river" in problem_type.lower() or "water" in problem_type.lower() else "landslide",
        "problem_type": problem_type,
        "confidence": round(float(confidence), 4),
        "confidence_label": _confidence_label(confidence),
        "investigation_priority": _priority_for(confidence, change_percentage, alignment_quality),
        "evidence": evidence,
        "explanation": explanation,
        "recommendation": recommendation,
        "uncertainty_reasons": [],
        "indicators": ["visual change", "feature-based evidence"],
    }


def interpret_change_result(environment: str, change_result: dict[str, Any], context: dict[str, Any] | None = None) -> dict[str, Any]:
    """Interpret a Phase 4 change result into candidate environmental problems."""
    context = _with_default_context(context or {})
    analysis_id = str(change_result.get("analysis_id", "analysis"))
    change_percentage = float(change_result.get("change_percentage", 0.0) or 0.0)
    alignment_quality = str(change_result.get("features", {}).get("alignment_quality", "good")).lower()
    features = change_result.get("features", {})

    warnings: list[str] = []
    if alignment_quality == "poor":
        warnings.append("Alignment quality is poor, which reduces confidence in the interpretation.")
    if change_percentage < 1.5:
        warnings.append("The detected visual change is very small; interpretation remains uncertain.")

    detections: list[dict[str, Any]] = []

    if environment == "river":
        boundary_ratio = float(features.get("boundary_adjacent_ratio", 0.0) or 0.0)
        water_change = float(features.get("water_like_change", 0.0) or 0.0)
        water_ratio = float(features.get("water_like_region_ratio", 0.0) or 0.0)
        vegetation_change = float(features.get("vegetation_loss", 0.0) or 0.0)

        if change_percentage >= 1.5 and (boundary_ratio >= 0.35 or water_change >= 0.2):
            confidence = 0.68 + min(0.24, change_percentage / 100.0 * 0.85) + min(0.08, boundary_ratio * 0.2)
            if context.get("recent_precipitation_event", "Unknown") == "No - Normal Flow":
                confidence -= 0.08
            confidence = min(0.94, max(0.35, confidence))
            if alignment_quality == "poor":
                confidence *= 0.8

            evidence = [
                f"{change_percentage:.2f}% of the image contains detected visual change.",
                "The primary changed region is spatially coherent and follows the river boundary.",
                "The detected pattern is consistent with a bank-edge or channel-margin adjustment.",
            ]
            if water_ratio > 0.2:
                evidence.append("The change overlaps an estimated water-like region, supporting a river morphologic interpretation.")

            detections.append(
                _build_detection(
                    "Potential Riverbank Erosion",
                    confidence,
                    evidence,
                    "Visual change is concentrated along the riverbank and appears to represent movement or displacement near the bank edge between observations.",
                    "Field verification recommended.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if water_change >= 0.2 or water_ratio >= 0.45:
            confidence = 0.62 + min(0.2, water_change * 0.25) + min(0.1, water_ratio * 0.2)
            confidence = min(0.93, max(0.28, confidence))
            if alignment_quality == "poor":
                confidence *= 0.75

            detections.append(
                _build_detection(
                    "Significant Water-Area Change",
                    confidence,
                    [
                        f"{change_percentage:.2f}% of the imagery shows a substantial difference in the apparent water footprint.",
                        "The detected region is spatially coherent within a water-dominant part of the scene.",
                    ],
                    "The observed variation is concentrated in the water-bearing portion of the scene and is consistent with a water-area change rather than a purely bank-only movement.",
                    "Review seasonal conditions and field observations before drawing conclusions.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if water_ratio >= 0.35 and change_percentage >= 2.5:
            confidence = 0.58 + min(0.2, change_percentage / 100.0 * 0.7)
            if alignment_quality == "poor":
                confidence *= 0.7
            detections.append(
                _build_detection(
                    "Exposed Riverbed",
                    min(0.9, max(0.26, confidence)),
                    [
                        f"{change_percentage:.2f}% of the scene shows an apparent lowering or exposure of channel material.",
                        "A water-like region appears to have given way to exposed or sediment-dominated ground.",
                    ],
                    "The pattern is consistent with exposure of riverbed material where water coverage appears reduced between observations.",
                    "Assess ecological flow and field conditions before operational conclusions.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if vegetation_change > 0.15 and change_percentage >= 2.0:
            detections.append(
                _build_detection(
                    "Potential Sediment-Related / Exposed-Bed Change",
                    0.52,
                    [
                        "The altered region includes broad texture and reflectance changes near the active channel.",
                        "The pattern is consistent with exposed sediment or a visibly altered bed surface.",
                    ],
                    "Surface texture and brightness change are consistent with sediment redistribution or exposed bed features in a river reach.",
                    "Perform sediment budget review and verify local navigation or intake-channel clearance.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if not detections:
            detections.append(
                _build_detection(
                    "Potential environmental change — interpretation uncertain",
                    0.22,
                    [
                        f"{change_percentage:.2f}% of the image contains detected visual change.",
                        "The observed change is weak, ambiguous, or lacks strong environment-specific evidence.",
                    ],
                    "The imagery shows a visual difference, but the available evidence is insufficient to support a confident river interpretation.",
                    "Field verification recommended before operational decisions.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )
            detections[0]["uncertainty_reasons"] = [
                "Insufficient visual evidence",
                "Limited alignment confidence",
                "Weak contextual support",
            ]

    elif environment == "landslide":
        vegetation_loss = float(features.get("vegetation_loss", 0.0) or 0.0)
        exposed_ground = float(features.get("exposed_ground_ratio", 0.0) or 0.0)
        change_intensity = float(features.get("change_intensity", 0.0) or 0.0)
        slope_angle = context.get("slope_angle_estimate", "Unknown")

        if change_percentage >= 2.0 and (vegetation_loss >= 0.2 or exposed_ground >= 0.2 or change_intensity >= 0.5):
            confidence = 0.60 + min(0.2, change_percentage / 100.0 * 0.85) + min(0.12, vegetation_loss * 0.25)
            if slope_angle != "Unknown" and "Steep" in str(slope_angle):
                confidence += 0.08
            confidence = min(0.95, max(0.3, confidence))
            if alignment_quality == "poor":
                confidence *= 0.75

            detections.append(
                _build_detection(
                    "Potential Landslide-related Change",
                    confidence,
                    [
                        f"{change_percentage:.2f}% of the image contains substantial visual change.",
                        "The changed region is coherent and concentrated in a terrain-dominant area.",
                        "Surface change is consistent with a displaced slope or exposed ground transition.",
                    ],
                    "The change pattern is consistent with a potential slope movement or terrain disturbance and should be reviewed with field context.",
                    "Field verification and slope assessment recommended.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if change_percentage >= 2.0 and (change_intensity >= 0.5 or exposed_ground >= 0.18):
            confidence = min(0.9, 0.58 + change_intensity * 0.35 + exposed_ground * 0.2)
            if alignment_quality == "poor":
                confidence *= 0.7
            detections.append(
                _build_detection(
                    "Potential Terrain Disturbance",
                    confidence,
                    [
                        "The altered terrain shows a sharp surface-texture change across a coherent region.",
                        "The pattern is consistent with disturbed ground or a localized cut/fill or slip surface.",
                    ],
                    "The change resembles disturbed terrain and surface deformation, which is consistent with a potential slope instability signal.",
                    "Field verification and slope inspection recommended.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if vegetation_loss >= 0.25:
            detections.append(
                _build_detection(
                    "Vegetation Loss / Canopy Stripping",
                    min(0.82, 0.45 + vegetation_loss * 0.7),
                    [
                        "A substantial vegetation-like region appears to have shifted to a more exposed or bare condition.",
                        "The pattern is spatially coherent and suggests canopy or ground cover loss.",
                    ],
                    "The visual evidence is consistent with vegetation loss or slope cover removal, although the broader geomorphic interpretation remains uncertain without field review.",
                    "Land-use or site-condition investigation recommended.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

        if not detections:
            detections.append(
                _build_detection(
                    "Potential environmental change — interpretation uncertain",
                    0.24,
                    [
                        f"{change_percentage:.2f}% of the image contains detected visual change.",
                        "The change is weak or insufficiently diagnostic of a landslide-related interpretation.",
                    ],
                    "The imagery shows change, but the available evidence does not strongly support a landslide interpretation.",
                    "Field verification recommended.",
                    analysis_id,
                    change_percentage,
                    alignment_quality,
                )
            )

    else:
        detections.append(
            _build_detection(
                "Potential environmental change — interpretation uncertain",
                0.2,
                [
                    "The environment type is not explicitly supported by the current interpretation engine.",
                    "The system can only report a generic visual change pattern at this stage.",
                ],
                "The platform detected visual change but does not yet have a reliable environment-specific interpretation for the selected domain.",
                "Field verification recommended.",
                analysis_id,
                change_percentage,
                alignment_quality,
            )
        )

    for detection in detections:
        detection["confidence"] = round(float(min(0.99, max(0.0, detection["confidence"]))), 4)
        detection["uncertainty_reasons"] = list(detection["uncertainty_reasons"] or [])
        if alignment_quality == "poor":
            detection["uncertainty_reasons"].append("Poor alignment quality")
        if change_percentage < 1.5:
            detection["uncertainty_reasons"].append("Low visual-change magnitude")
        if detection["confidence"] < 0.45:
            detection["confidence_label"] = "Low confidence"
        if detection["confidence"] >= 0.7:
            detection["confidence_label"] = "High confidence"
        elif detection["confidence"] >= 0.45:
            detection["confidence_label"] = "Moderate confidence"

    detections.sort(key=lambda d: d["confidence"], reverse=True)

    payload = {
        "analysis_id": analysis_id,
        "environment_type": environment,
        "status": "completed",
        "detections": detections,
        "warnings": warnings,
        "limitations": [
            "Interpretation is based on visual image comparison and MVP classification heuristics. Field verification is recommended before operational decisions.",
        ],
    }

    return payload
