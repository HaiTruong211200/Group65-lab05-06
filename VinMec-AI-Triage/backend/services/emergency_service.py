"""
Emergency Detection Service — Dual-layer approach.

Layer 1: Fast keyword matching (~0ms) — catches obvious danger signals
Layer 2: Gemini AI severity scoring (~1-2s) — catches subtle/ambiguous symptoms

Severity levels:
- CRITICAL: Life-threatening → is_emergency = true
- HIGH:     Urgent intervention → is_emergency = true
- MEDIUM:   Needs prompt care   → is_emergency = false
- LOW:      Standard scheduling  → is_emergency = false
"""

import json
import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

_severity_model = genai.GenerativeModel(
    settings.TRIAGE_MODEL,
    generation_config={"response_mime_type": "application/json"},
)

SEVERITY_PROMPT = """Bạn là bác sĩ cấp cứu tại bệnh viện VinMec.
Đánh giá mức độ nguy hiểm của triệu chứng sau và trả về JSON:

{{
    "severity": "CRITICAL hoặc HIGH hoặc MEDIUM hoặc LOW",
    "is_emergency": true hoặc false,
    "reasoning": "giải thích ngắn gọn bằng tiếng Việt",
    "emergency_message": "thông báo cho bệnh nhân nếu cấp cứu, để trống nếu không"
}}

Quy tắc phân loại:
- CRITICAL: Đe dọa tính mạng ngay lập tức (đau thắt ngực, khó thở dữ dội, mất ý thức, co giật, chảy máu ồ ạt, đột quỵ). is_emergency = true
- HIGH: Cần can thiệp y tế khẩn cấp trong vài giờ (sốt cao >40°C, đau bụng dữ dội, chấn thương nặng). is_emergency = true
- MEDIUM: Cần khám sớm nhưng không khẩn cấp (sốt vừa, đau kéo dài, triệu chứng tái phát). is_emergency = false
- LOW: Triệu chứng nhẹ, có thể đặt lịch khám bình thường. is_emergency = false

Triệu chứng: "{symptom}"
"""


def check_emergency(symptom: str) -> dict:
    """
    Dual-layer emergency detection.
    Always runs both layers for comprehensive assessment.
    """
    default_result = {
        "is_emergency": False,
        "emergency_message": "",
        "severity": "NORMAL",
        "reasoning": "",
    }

    # Layer 1: Fast keyword scan
    symptom_lower = symptom.lower()
    keyword_match = any(
        kw in symptom_lower for kw in settings.EMERGENCY_KEYWORDS
    )

    # Layer 2: AI severity scoring (always run for comprehensive check)
    ai_result = _ai_severity_check(symptom)

    if ai_result:
        return ai_result

    # If AI fails but keywords matched → fallback to CRITICAL
    if keyword_match:
        return {
            "is_emergency": True,
            "emergency_message": (
                "⚠️ Phát hiện dấu hiệu nguy hiểm! "
                "Vui lòng gọi Cấp cứu NGAY hoặc nhấn nút Khẩn cấp."
            ),
            "severity": "CRITICAL",
            "reasoning": "Phát hiện từ khóa triệu chứng nguy hiểm.",
        }

    return default_result


def _ai_severity_check(symptom: str) -> dict | None:
    """
    Use Gemini to assess symptom severity with medical reasoning.
    Returns parsed result, or None if AI call fails.
    """
    try:
        prompt = SEVERITY_PROMPT.replace("{symptom}", symptom)
        response = _severity_model.generate_content(prompt)
        result = json.loads(response.text)

        return {
            "is_emergency": result.get("is_emergency", False),
            "emergency_message": result.get("emergency_message", ""),
            "severity": result.get("severity", "LOW"),
            "reasoning": result.get("reasoning", ""),
        }
    except Exception as e:
        print(f"[EMERGENCY] AI severity check failed: {e}")
        return None
