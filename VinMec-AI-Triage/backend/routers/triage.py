"""
Triage Router — POST /api/agent/triage

Full pipeline:
1. RAG: retrieve similar past cases via Vector Search
2. Build augmented prompt with RAG context
3. Call Gemini for triage analysis
4. Emergency detection (keyword + AI severity)
5. Generate embedding & save to MongoDB
"""

import json
import datetime

from fastapi import APIRouter, HTTPException
import google.generativeai as genai

from config import settings
from database import logs_collection
from schemas import TriageRequest, TriageResponse
from services.rag_service import retrieve_similar_feedback, build_rag_context
from services.embedding_service import generate_embedding
from services.emergency_service import check_emergency

router = APIRouter()

genai.configure(api_key=settings.GEMINI_API_KEY)
triage_model = genai.GenerativeModel(
    settings.TRIAGE_MODEL,
    generation_config={"response_mime_type": "application/json"},
)

BASE_PROMPT = """Bạn là bác sĩ phân loại bệnh nhân tại bệnh viện VinMec.
Phân tích triệu chứng sau và trả về Top 3 chuyên khoa phù hợp nhất.
Bắt buộc trả về đúng định dạng JSON này:
{{"top_3": [{{"department": "tên khoa", "confidence": số_từ_1_đến_100}}]}}

Lưu ý:
- confidence phải là số nguyên từ 1 đến 100
- Sắp xếp theo confidence giảm dần
- Tên khoa phải bằng tiếng Việt, chính xác theo danh mục VinMec
{rag_context}
Triệu chứng của bệnh nhân: "{symptom}"
"""


@router.post("/triage", response_model=TriageResponse)
async def get_triage(request: TriageRequest):
    try:
        # Step 1: RAG — retrieve similar past cases
        similar_feedbacks = retrieve_similar_feedback(request.symptom)
        rag_context = build_rag_context(similar_feedbacks)
        rag_feedback_count = len(similar_feedbacks)

        # Step 2: Build augmented prompt
        prompt = BASE_PROMPT.format(
            rag_context=rag_context, symptom=request.symptom
        )

        # Step 3: Call Gemini for triage
        response = triage_model.generate_content(prompt)
        ai_result = json.loads(response.text)

        # Step 4: Emergency detection (keyword + AI severity)
        emergency_info = check_emergency(request.symptom)
        is_emergency = emergency_info["is_emergency"]
        emergency_message = emergency_info["emergency_message"]
        severity = emergency_info["severity"]

        # Step 5: Generate embedding for this symptom
        try:
            symptom_embedding = generate_embedding(request.symptom)
        except Exception as e:
            print(f"[TRIAGE] Embedding generation failed: {e}")
            symptom_embedding = None

        # Step 6: Save to MongoDB
        log_data = {
            "raw_symptom": request.symptom,
            "symptom_embedding": symptom_embedding,
            "ai_top_3": ai_result.get("top_3", []),
            "user_final_choice": None,
            "is_corrected": False,
            "handoff_triggered": False,
            "user_rating": None,
            "is_emergency": is_emergency,
            "severity": severity,
            "rag_context_used": rag_feedback_count > 0,
            "rag_feedback_count": rag_feedback_count,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
        }
        insert_result = logs_collection.insert_one(log_data)

        return TriageResponse(
            log_id=str(insert_result.inserted_id),
            result=ai_result,
            is_emergency=is_emergency,
            emergency_message=emergency_message,
            severity=severity,
            rag_feedback_count=rag_feedback_count,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
