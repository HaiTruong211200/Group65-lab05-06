"""
Feedback Router — POST /api/agent/feedback

Saves user feedback to MongoDB and re-generates enriched embedding
for the confirmed symptom-department pair to improve future RAG.
"""

import datetime

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database import logs_collection
from schemas import FeedbackRequest, FeedbackResponse
from services.embedding_service import generate_embedding

router = APIRouter()


@router.post("/feedback", response_model=FeedbackResponse)
async def save_feedback(request: FeedbackRequest):
    try:
        old_log = logs_collection.find_one(
            {"_id": ObjectId(request.log_id)}
        )
        if not old_log:
            raise HTTPException(status_code=404, detail="Log not found")

        # Check if AI's top-1 was corrected by user
        top_1_ai = (
            old_log["ai_top_3"][0]["department"]
            if old_log.get("ai_top_3")
            else ""
        )
        is_corrected = request.user_final_choice != top_1_ai

        # Re-embed with enriched text (symptom + confirmed department)
        # This makes future RAG retrieval more accurate
        enriched_text = (
            f"{old_log.get('raw_symptom', '')} - "
            f"Khoa: {request.user_final_choice}"
        )
        try:
            updated_embedding = generate_embedding(enriched_text)
        except Exception as e:
            print(f"[FEEDBACK] Re-embedding failed: {e}")
            updated_embedding = old_log.get("symptom_embedding")

        # Update log with feedback + new embedding
        update_data = {
            "user_final_choice": request.user_final_choice,
            "handoff_triggered": request.handoff_triggered,
            "is_corrected": is_corrected,
            "user_rating": request.user_rating,
            "symptom_embedding": updated_embedding,
            "feedback_timestamp": datetime.datetime.now(
                datetime.timezone.utc
            ),
        }

        logs_collection.update_one(
            {"_id": ObjectId(request.log_id)},
            {"$set": update_data},
        )

        return FeedbackResponse(
            status="success",
            message=(
                "Flywheel data updated! "
                f"{'AI was corrected.' if is_corrected else 'AI was correct.'}"
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
