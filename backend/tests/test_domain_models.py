"""Unit tests for domain models and data validation."""

import pytest
from datetime import datetime
from pydantic import ValidationError
from app.models.domain import (
    User,
    UserRole,
    Area,
    EnvironmentType,
    Image,
    ImageType,
    Analysis,
    AnalysisStatus,
    Detection,
    SeverityLevel,
    Review,
    ReviewDecision,
    CitizenReport,
    ReportStatus,
)


def test_user_model_defaults() -> None:
    user = User(
        id="usr-001",
        name="Officer Jane Doe",
        email="jane.doe@disaster-mgmt.gov",
    )
    assert user.role == UserRole.OFFICER
    assert user.department == "Disaster Management Division"


def test_area_model_valid() -> None:
    area = Area(
        id="area-periyar-01",
        name="Periyar Lower Reach Sector 4",
        environment_type=EnvironmentType.RIVER,
        coordinates={"type": "Point", "coordinates": [76.2711, 10.0159]},
    )
    assert area.environment_type == EnvironmentType.RIVER
    assert area.name == "Periyar Lower Reach Sector 4"


def test_detection_confidence_boundaries() -> None:
    # Valid confidence within [0.0, 1.0]
    detection = Detection(
        id="det-001",
        analysis_id="anl-001",
        problem_type="Potential Riverbank Erosion",
        severity=SeverityLevel.HIGH,
        confidence=0.875,
        change_percentage=14.2,
        evidence_summary="Lateral cut bank displacement observed on south bank",
        explanation="Spectral reflectance indicates water intrusion into previously vegetated embankment",
        recommendation="Recommended Action: Field Verification and Embankment Inspection",
    )
    assert detection.confidence == 0.875
    assert detection.severity == SeverityLevel.HIGH

    # Invalid confidence > 1.0 should fail validation
    with pytest.raises(ValidationError):
        Detection(
            id="det-002",
            analysis_id="anl-001",
            problem_type="Potential Riverbank Erosion",
            severity=SeverityLevel.HIGH,
            confidence=1.5,  # Out of range!
            evidence_summary="Invalid confidence test",
            explanation="Should raise ValidationError",
            recommendation="None",
        )

    # Invalid confidence < 0.0 should fail validation
    with pytest.raises(ValidationError):
        Detection(
            id="det-003",
            analysis_id="anl-001",
            problem_type="Potential Riverbank Erosion",
            severity=SeverityLevel.HIGH,
            confidence=-0.1,  # Out of range!
            evidence_summary="Invalid confidence test",
            explanation="Should raise ValidationError",
            recommendation="None",
        )


def test_human_review_model() -> None:
    review = Review(
        id="rev-001",
        detection_id="det-001",
        reviewer_id="usr-001",
        decision=ReviewDecision.CONFIRMED,
        comment="Ground inspection confirms 3.2m bank retreat following recent surge event.",
    )
    assert review.decision == ReviewDecision.CONFIRMED
    assert review.reviewer_id == "usr-001"
    assert isinstance(review.created_at, datetime)


def test_analysis_model_lifecycle() -> None:
    analysis = Analysis(
        id="anl-100",
        area_id="area-periyar-01",
        environment_type=EnvironmentType.RIVER,
        before_image_id="img-before-01",
        after_image_id="img-after-01",
        status=AnalysisStatus.DRAFT,
    )
    assert analysis.status == AnalysisStatus.DRAFT
    assert len(analysis.detections) == 0


def test_citizen_report_model() -> None:
    report = CitizenReport(
        id="cr-001",
        environment_type="river",
        location="Bridge Pier 4, Aluva",
        description="Noticed sudden crack and soil falling into riverbed after yesterday's rain.",
        status=ReportStatus.SUBMITTED,
        latitude=10.085,
        longitude=76.315,
        image_path="/storage/citizen_reports/cr-001.png",
    )
    assert report.status == ReportStatus.SUBMITTED
    assert report.environment_type == "river"
    assert report.latitude == 10.085
    assert report.longitude == 76.315

    with pytest.raises(ValidationError):
        CitizenReport(
            id="cr-invalid",
            environment_type="unknown",
            location="",
            description="",
            latitude=200,
            longitude=200,
        )
