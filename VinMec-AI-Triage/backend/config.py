"""
Centralized configuration for VinMec AI Triage backend.
Loads environment variables and provides application-wide settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # MongoDB Atlas
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "vinmec_hackathon")
    COLLECTION_NAME: str = "triage_flywheel"

    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TRIAGE_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "embedding-001"
    EMBEDDING_DIMENSIONS: int = 768

    # RAG
    RAG_TOP_K: int = 5
    VECTOR_INDEX_NAME: str = "symptom_vector_index"

    # Emergency keywords (Layer 1: fast rule-based)
    EMERGENCY_KEYWORDS: list[str] = [
        "đau thắt ngực",
        "khó thở dữ dội",
        "mất ý thức",
        "co giật",
        "chảy máu nhiều",
        "đột quỵ",
        "ngất xỉu",
        "sốt cao co giật",
        "đau ngực trái lan ra tay",
        "tê liệt nửa người",
        "nôn ra máu",
        "khó thở nghiêm trọng",
        "ngừng thở",
        "hôn mê",
        "sốc phản vệ",
        "chấn thương đầu nặng",
        "gãy xương hở",
        "bỏng nặng",
        "ngộ độc",
        "đuối nước",
    ]


settings = Settings()
