"""
Pydantic models for API request/response validation.
"""

from pydantic import BaseModel
from typing import Optional


# --- Requests ---

class TriageRequest(BaseModel):
    symptom: str


class FeedbackRequest(BaseModel):
    log_id: str
    user_final_choice: str
    handoff_triggered: bool
    user_rating: Optional[bool] = None


# --- Responses ---

class TriageResponse(BaseModel):
    log_id: str
    result: dict
    is_emergency: bool = False
    emergency_message: str = ""
    severity: str = "NORMAL"
    rag_feedback_count: int = 0


class FeedbackResponse(BaseModel):
    status: str
    message: str
