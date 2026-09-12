"""Core domain models for Environmental Intelligence Platform.

Architected to strictly adhere to scientific terminology standards:
- Detection labels use probabilistic, evidence-grounded phrasing (e.g. "Potential Riverbank Erosion").
- AI Confidence measures classification certainty, never disaster occurrence probability.
- Human review is a first-class domain concept.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


class UserRole(str, Enum):
    OFFICER = "officer"
    CITIZEN = "citizen"
    ADMIN = "admin"


class EnvironmentType(str, Enum):
    RIVER = "river"
    LANDSLIDE = "landslide"
    FOREST = "forest"
    COASTLINE = "coastline"
    WETLAND = "wetland"
    AGRICULTURE = "agriculture"
    WILDFIRE = "wildfire"


class ImageType(str, Enum):
    BEFORE = "before"
    AFTER = "after"


class AnalysisStatus(str, Enum):
    DRAFT = "draft"
    VALIDATING = "validating"
    READY = "ready"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REVIEWED = "reviewed"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReportStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VALIDATED = "validated"
    DISMISSED = "dismissed"


class ReviewDecision(str, Enum):
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INCONCLUSIVE = "inconclusive"


class User(BaseModel):
    id: str
    name: str
    role: UserRole = UserRole.OFFICER
    email: str
    department: Optional[str] = "Disaster Management Division"


class Area(BaseModel):
    id: str
    name: str
    environment_type: EnvironmentType
    coordinates: Optional[dict[str, Any]] = None  # GeoJSON / bounding box representation
    description: Optional[str] = None


class ImageMetadata(BaseModel):
    width: Optional[int] = None
    height: Optional[int] = None
    resolution_meters_per_pixel: Optional[float] = None
    cloud_cover_percentage: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    file_format: Optional[str] = None
    sensor: Optional[str] = None


class Image(BaseModel):
    id: str
    area_id: str
    image_type: ImageType
    date: datetime
    file_path: str
    source: str = "local_upload"
    metadata: Optional[ImageMetadata] = None


class Detection(BaseModel):
    """Represents a specific localized environmental change detection.
    
    IMPORTANT:
    - problem_type uses caution terminology (e.g. 'Potential Riverbank Erosion').
    - confidence represents classifier certainty (0.0 to 1.0), NOT disaster probability.
    """
    id: str
    analysis_id: str
    problem_type: str
    severity: SeverityLevel
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score in detection classification [0.0 - 1.0]. Not disaster probability.",
    )
    change_percentage: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Estimated percentage of area surface subject to detected change.",
    )
    geometry: Optional[dict[str, Any]] = None  # Polygon/bounding box of detected region
    evidence_summary: str
    explanation: str
    recommendation: str

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("Confidence must be strictly between 0.0 and 1.0")
        return round(v, 4)


class Analysis(BaseModel):
    id: str
    area_id: str
    environment_type: EnvironmentType
    before_image_id: str
    after_image_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: AnalysisStatus = AnalysisStatus.DRAFT
    investigation_notes: Optional[str] = None
    detections: list[Detection] = Field(default_factory=list)


class CitizenReport(BaseModel):
    id: str
    location: str
    description: str
    image_path: Optional[str] = None
    status: ReportStatus = ReportStatus.SUBMITTED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    contact_email: Optional[str] = None


class Review(BaseModel):
    """Enforces Human-in-the-Loop verification for AI detections."""
    id: str
    detection_id: str
    reviewer_id: str
    decision: ReviewDecision
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
