"""Service layer for the environmental intelligence platform."""

from app.services.environment_interpretation import interpret_change_result
from app.services.image_processing import process_image_pair

__all__ = ["process_image_pair", "interpret_change_result"]
