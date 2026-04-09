"""
Gemini Embedding Service.
Uses text-embedding-004 to generate 768-dimension vector embeddings.
Two task types for optimal retrieval:
- RETRIEVAL_DOCUMENT: for storing embeddings in MongoDB
- RETRIEVAL_QUERY: for searching similar documents
"""

import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


def generate_embedding(text: str) -> list[float]:
    """
    Generate embedding for a document (symptom log stored in MongoDB).
    Uses RETRIEVAL_DOCUMENT task type.
    """
    result = genai.embed_content(
        model=f"gemini-embedding-001",
        content=text,
        task_type="RETRIEVAL_DOCUMENT",
    )
    return result["embedding"]


def generate_query_embedding(text: str) -> list[float]:
    """
    Generate embedding for a search query (incoming symptom).
    Uses RETRIEVAL_QUERY task type for optimal search performance.
    """
    result = genai.embed_content(
        model=f"gemini-embedding-001",
        content=text,
        task_type="RETRIEVAL_QUERY",
    )
    return result["embedding"]
