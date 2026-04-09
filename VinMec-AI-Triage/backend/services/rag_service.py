"""
RAG Service — Retrieval-Augmented Generation.
Uses MongoDB Atlas Vector Search to find similar past feedback,
then builds context to augment Gemini triage prompt.

Primary: Atlas Vector Search (cosine similarity, 768d)
Fallback: MongoDB Text Search (if vector search unavailable)
"""

from database import logs_collection
from services.embedding_service import generate_query_embedding
from config import settings


def retrieve_similar_feedback(symptom: str, top_k: int = None) -> list[dict]:
    """
    Find past triage cases with similar symptoms via Vector Search.
    Only retrieves validated feedback (user_final_choice is set).
    Filters out negatively rated feedback.
    """
    if top_k is None:
        top_k = settings.RAG_TOP_K

    try:
        query_embedding = generate_query_embedding(symptom)

        pipeline = [
            {
                "$vectorSearch": {
                    "index": settings.VECTOR_INDEX_NAME,
                    "path": "symptom_embedding",
                    "queryVector": query_embedding,
                    "numCandidates": top_k * 10,
                    "limit": top_k,
                    "filter": {
                        "user_final_choice": {"$ne": None}
                    },
                }
            },
            {
                "$project": {
                    "raw_symptom": 1,
                    "user_final_choice": 1,
                    "ai_top_3": 1,
                    "is_corrected": 1,
                    "user_rating": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]

        results = list(logs_collection.aggregate(pipeline))
        # Filter out negatively rated feedback
        results = [r for r in results if r.get("user_rating") is not False]
        return results

    except Exception as e:
        print(f"[RAG] Vector Search failed, falling back to text search: {e}")
        return _fallback_text_search(symptom, top_k)


def _fallback_text_search(symptom: str, top_k: int) -> list[dict]:
    """Fallback to MongoDB text search if Vector Search is unavailable."""
    try:
        results = (
            logs_collection.find(
                {
                    "$text": {"$search": symptom},
                    "user_final_choice": {"$ne": None},
                },
                {"score": {"$meta": "textScore"}},
            )
            .sort([("score", {"$meta": "textScore"})])
            .limit(top_k)
        )
        return list(results)
    except Exception:
        return []


def build_rag_context(feedbacks: list[dict]) -> str:
    """
    Convert retrieved feedback into context string for prompt injection.
    Prioritizes corrected cases (AI was wrong → user fixed) as strongest learning signal.
    """
    if not feedbacks:
        return ""

    lines = ["\n--- DỮ LIỆU THAM KHẢO TỪ CÁC BỆNH NHÂN TRƯỚC ĐÓ ---"]

    # Sort: corrected cases first (most valuable)
    sorted_fb = sorted(
        feedbacks, key=lambda x: x.get("is_corrected", False), reverse=True
    )

    for fb in sorted_fb:
        symptom = fb.get("raw_symptom", "N/A")
        actual = fb.get("user_final_choice", "N/A")
        corrected = fb.get("is_corrected", False)
        score = fb.get("score", 0)

        if corrected:
            ai_top1 = (
                fb["ai_top_3"][0]["department"]
                if fb.get("ai_top_3")
                else "N/A"
            )
            lines.append(
                f'- Triệu chứng: "{symptom}" → AI gợi ý: {ai_top1} '
                f"(SAI) → Khoa thực tế: {actual} "
                f"[tương đồng: {score:.2f}]"
            )
        else:
            lines.append(
                f'- Triệu chứng: "{symptom}" → Khoa: {actual} '
                f"(AI đúng) [tương đồng: {score:.2f}]"
            )

    lines.append("Hãy tham khảo dữ liệu trên để cải thiện độ chính xác.")
    lines.append("--- KẾT THÚC DỮ LIỆU THAM KHẢO ---\n")

    return "\n".join(lines)
