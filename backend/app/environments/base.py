"""Base environment abstraction.

All specific environments (River, Landslide, Forest, Coastline, etc.) inherit from BaseEnvironment.
This enforces modularity, ensuring that environment-specific detection logic, questions,
and terminology remain strictly isolated from common change detection infrastructure.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
from pydantic import BaseModel
from app.models.domain import EnvironmentType, SeverityLevel


class ProblemTypeDefinition(BaseModel):
    problem_type_id: str
    display_name: str
    description: str
    default_severity: SeverityLevel
    recommended_action: str


class GuidedQuestion(BaseModel):
    id: str
    prompt: str
    input_type: str  # "text" | "select" | "boolean" | "number"
    options: Optional[list[str]] = None
    required: bool = False
    helper_text: Optional[str] = None


class ValidationRule(BaseModel):
    key: str
    description: str
    rule_type: str  # "dimension_ratio" | "file_type" | "max_cloud_cover" | "date_order"
    threshold: Optional[float] = None
    allowed_values: Optional[list[str]] = None


class BaseEnvironment(ABC):
    """Abstract base definition for any monitored environmental domain."""

    @property
    @abstractmethod
    def environment_id(self) -> EnvironmentType:
        """Unique identifier matching EnvironmentType enum."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable name, e.g. 'River System'."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Domain description."""
        pass

    @property
    @abstractmethod
    def is_primary(self) -> bool:
        """Whether this is the primary MVP demonstration environment."""
        pass

    @property
    @abstractmethod
    def supported_problem_types(self) -> list[ProblemTypeDefinition]:
        """List of detectable potential environmental changes."""
        pass

    @property
    @abstractmethod
    def guided_questions(self) -> list[GuidedQuestion]:
        """Investigation context questions presented to the officer."""
        pass

    @property
    @abstractmethod
    def validation_rules(self) -> list[ValidationRule]:
        """Rules used to validate imagery and environmental metadata."""
        pass

    def get_problem_type(self, problem_type_id: str) -> Optional[ProblemTypeDefinition]:
        for pt in self.supported_problem_types:
            if pt.problem_type_id == problem_type_id:
                return pt
        return None

    def to_dict(self) -> dict[str, Any]:
        return {
            "environment_id": self.environment_id.value,
            "display_name": self.display_name,
            "description": self.description,
            "is_primary": self.is_primary,
            "supported_problem_types": [pt.model_dump() for pt in self.supported_problem_types],
            "guided_questions": [q.model_dump() for q in self.guided_questions],
            "validation_rules": [r.model_dump() for r in self.validation_rules],
        }
