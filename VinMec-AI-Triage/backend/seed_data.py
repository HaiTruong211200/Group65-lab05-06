"""
Seed script — Generate fake data for MongoDB triage_flywheel collection.
Includes realistic Vietnamese symptom data with Gemini embeddings.

Usage:
    python seed_data.py
"""

import datetime
import random
from config import settings
from database import logs_collection
from services.embedding_service import generate_embedding

# ============================================================
# Dữ liệu mẫu: 20 cases thực tế với feedback đã confirm
# ============================================================
SEED_CASES = [
    # --- Nội tiêu hóa ---
    {
        "raw_symptom": "Tôi bị đau bụng 2 ngày nay và hơi buồn nôn",
        "ai_top_3": [
            {"department": "Nội tiêu hóa", "confidence": 88},
            {"department": "Ngoại tổng quát", "confidence": 65},
            {"department": "Nội tổng quát", "confidence": 40},
        ],
        "user_final_choice": "Nội tiêu hóa",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Đau dạ dày âm ỉ, ợ chua liên tục, ăn không tiêu",
        "ai_top_3": [
            {"department": "Nội tiêu hóa", "confidence": 92},
            {"department": "Nội tổng quát", "confidence": 55},
            {"department": "Dinh dưỡng", "confidence": 30},
        ],
        "user_final_choice": "Nội tiêu hóa",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Đi ngoài phân lỏng 5-6 lần một ngày, bụng sôi ùng ục",
        "ai_top_3": [
            {"department": "Nội tiêu hóa", "confidence": 90},
            {"department": "Nội tổng quát", "confidence": 50},
            {"department": "Truyền nhiễm", "confidence": 45},
        ],
        "user_final_choice": "Nội tiêu hóa",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Tim mạch ---
    {
        "raw_symptom": "Tôi bị đau tức ngực và hay hụt hơi khi leo cầu thang",
        "ai_top_3": [
            {"department": "Tim mạch", "confidence": 90},
            {"department": "Hô hấp", "confidence": 60},
            {"department": "Nội tổng quát", "confidence": 35},
        ],
        "user_final_choice": "Tim mạch",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Tim đập nhanh bất thường, hồi hộp, chóng mặt khi đứng dậy",
        "ai_top_3": [
            {"department": "Tim mạch", "confidence": 85},
            {"department": "Nội tổng quát", "confidence": 55},
            {"department": "Thần kinh", "confidence": 40},
        ],
        "user_final_choice": "Tim mạch",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Cơ xương khớp ---
    {
        "raw_symptom": "Đau lưng dữ dội lan xuống chân trái, tê bì ngón chân",
        "ai_top_3": [
            {"department": "Cơ xương khớp", "confidence": 88},
            {"department": "Thần kinh", "confidence": 65},
            {"department": "Phục hồi chức năng", "confidence": 45},
        ],
        "user_final_choice": "Cơ xương khớp",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Khớp gối sưng đau, cứng khớp buổi sáng kéo dài hơn 30 phút",
        "ai_top_3": [
            {"department": "Cơ xương khớp", "confidence": 92},
            {"department": "Nội tổng quát", "confidence": 40},
            {"department": "Phục hồi chức năng", "confidence": 35},
        ],
        "user_final_choice": "Cơ xương khớp",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Da liễu → Corrected case (AI sai) ---
    {
        "raw_symptom": "Nổi mẩn ngứa toàn thân kèm sưng khớp tay",
        "ai_top_3": [
            {"department": "Da liễu", "confidence": 75},
            {"department": "Dị ứng miễn dịch", "confidence": 70},
            {"department": "Cơ xương khớp", "confidence": 55},
        ],
        "user_final_choice": "Dị ứng miễn dịch",
        "is_corrected": True,  # AI đề xuất Da liễu nhưng user chọn Dị ứng
        "user_rating": False,
    },
    # --- Thần kinh ---
    {
        "raw_symptom": "Đau đầu kéo dài 1 tuần, mờ mắt, buồn nôn",
        "ai_top_3": [
            {"department": "Thần kinh", "confidence": 85},
            {"department": "Mắt", "confidence": 60},
            {"department": "Nội tổng quát", "confidence": 40},
        ],
        "user_final_choice": "Thần kinh",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Tê tay chân, yếu cơ tay phải, khó cầm đồ vật",
        "ai_top_3": [
            {"department": "Thần kinh", "confidence": 88},
            {"department": "Cơ xương khớp", "confidence": 55},
            {"department": "Phục hồi chức năng", "confidence": 45},
        ],
        "user_final_choice": "Thần kinh",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Hô hấp ---
    {
        "raw_symptom": "Ho khan kéo dài 2 tuần, đờm xanh, sốt nhẹ về chiều",
        "ai_top_3": [
            {"department": "Hô hấp", "confidence": 90},
            {"department": "Truyền nhiễm", "confidence": 50},
            {"department": "Nội tổng quát", "confidence": 35},
        ],
        "user_final_choice": "Hô hấp",
        "is_corrected": False,
        "user_rating": True,
    },
    {
        "raw_symptom": "Khó thở khi nằm, thở khò khè, hay thức dậy giữa đêm vì tức ngực",
        "ai_top_3": [
            {"department": "Hô hấp", "confidence": 82},
            {"department": "Tim mạch", "confidence": 75},
            {"department": "Dị ứng miễn dịch", "confidence": 40},
        ],
        "user_final_choice": "Hô hấp",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Tai Mũi Họng ---
    {
        "raw_symptom": "Đau họng, nuốt vướng, sưng hạch cổ 1 bên",
        "ai_top_3": [
            {"department": "Tai Mũi Họng", "confidence": 88},
            {"department": "Nội tổng quát", "confidence": 45},
            {"department": "Ung bướu", "confidence": 30},
        ],
        "user_final_choice": "Tai Mũi Họng",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Nội tiết ---
    {
        "raw_symptom": "Khát nước nhiều, đi tiểu thường xuyên, sụt cân không rõ lý do",
        "ai_top_3": [
            {"department": "Nội tiết", "confidence": 92},
            {"department": "Nội tổng quát", "confidence": 50},
            {"department": "Thận - Tiết niệu", "confidence": 40},
        ],
        "user_final_choice": "Nội tiết",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Mắt ---
    {
        "raw_symptom": "Mắt đỏ, chảy nước mắt, nhìn mờ buổi sáng",
        "ai_top_3": [
            {"department": "Mắt", "confidence": 90},
            {"department": "Dị ứng miễn dịch", "confidence": 40},
            {"department": "Nội tổng quát", "confidence": 25},
        ],
        "user_final_choice": "Mắt",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Sản phụ khoa ---
    {
        "raw_symptom": "Đau bụng dưới âm ỉ, kinh nguyệt không đều 3 tháng nay",
        "ai_top_3": [
            {"department": "Sản phụ khoa", "confidence": 88},
            {"department": "Nội tổng quát", "confidence": 40},
            {"department": "Nội tiết", "confidence": 35},
        ],
        "user_final_choice": "Sản phụ khoa",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Thận - Tiết niệu ---
    {
        "raw_symptom": "Đau hông lưng bên phải, tiểu buốt, nước tiểu đục",
        "ai_top_3": [
            {"department": "Thận - Tiết niệu", "confidence": 90},
            {"department": "Ngoại tổng quát", "confidence": 55},
            {"department": "Nội tổng quát", "confidence": 30},
        ],
        "user_final_choice": "Thận - Tiết niệu",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Corrected case: Ngoại → Nội (AI sai) ---
    {
        "raw_symptom": "Đau bụng quặn từng cơn vùng rốn, sốt nhẹ, nôn",
        "ai_top_3": [
            {"department": "Ngoại tổng quát", "confidence": 78},
            {"department": "Nội tiêu hóa", "confidence": 72},
            {"department": "Truyền nhiễm", "confidence": 45},
        ],
        "user_final_choice": "Nội tiêu hóa",
        "is_corrected": True,  # AI đề xuất Ngoại nhưng user chọn Nội tiêu hóa
        "user_rating": True,
    },
    # --- Da liễu ---
    {
        "raw_symptom": "Vùng da mặt nổi mụn đỏ viêm, ngứa, bong tróc",
        "ai_top_3": [
            {"department": "Da liễu", "confidence": 92},
            {"department": "Dị ứng miễn dịch", "confidence": 45},
            {"department": "Nội tổng quát", "confidence": 20},
        ],
        "user_final_choice": "Da liễu",
        "is_corrected": False,
        "user_rating": True,
    },
    # --- Handoff case ---
    {
        "raw_symptom": "Thấy không khỏe trong người, mệt mỏi chung chung",
        "ai_top_3": [
            {"department": "Nội tổng quát", "confidence": 60},
            {"department": "Thần kinh", "confidence": 35},
            {"department": "Nội tiết", "confidence": 30},
        ],
        "user_final_choice": "Gặp lễ tân",
        "is_corrected": True,
        "handoff_triggered": True,
        "user_rating": None,
    },
]


def seed_database():
    """Insert seed data into MongoDB with Gemini embeddings."""
    print(f"🌱 Bắt đầu seed data vào collection: {settings.COLLECTION_NAME}")
    print(f"   Database: {settings.DB_NAME}")
    print(f"   Số cases: {len(SEED_CASES)}")
    print()

    inserted = 0
    failed = 0

    for i, case in enumerate(SEED_CASES):
        symptom = case["raw_symptom"]
        print(f"  [{i+1:2d}/{len(SEED_CASES)}] {symptom[:50]}...", end=" ")

        try:
            # Generate embedding for this symptom
            # Enrich with department if feedback exists
            if case["user_final_choice"] and case["user_final_choice"] != "Gặp lễ tân":
                embed_text = f"{symptom} - Khoa: {case['user_final_choice']}"
            else:
                embed_text = symptom

            embedding = generate_embedding(embed_text)

            # Build document matching app schema
            doc = {
                "raw_symptom": symptom,
                "symptom_embedding": embedding,
                "ai_top_3": case["ai_top_3"],
                "user_final_choice": case["user_final_choice"],
                "is_corrected": case.get("is_corrected", False),
                "handoff_triggered": case.get("handoff_triggered", False),
                "user_rating": case.get("user_rating"),
                "is_emergency": False,
                "severity": "NORMAL",
                "rag_context_used": False,
                "rag_feedback_count": 0,
                "timestamp": datetime.datetime.now(datetime.timezone.utc)
                - datetime.timedelta(
                    days=random.randint(1, 30),
                    hours=random.randint(0, 23),
                ),
                "feedback_timestamp": datetime.datetime.now(
                    datetime.timezone.utc
                )
                - datetime.timedelta(
                    days=random.randint(0, 29),
                    hours=random.randint(0, 23),
                ),
            }

            logs_collection.insert_one(doc)
            inserted += 1
            print("✅")

        except Exception as e:
            failed += 1
            print(f"❌ {e}")

    print()
    print(f"🎉 Seed hoàn thành: {inserted} thành công, {failed} thất bại")
    print(f"   Tổng documents trong collection: {logs_collection.count_documents({})}")


def clear_collection():
    """Clear all data from the collection."""
    count = logs_collection.count_documents({})
    if count > 0:
        result = logs_collection.delete_many({})
        print(f"🗑️  Đã xóa {result.deleted_count} documents cũ")
    else:
        print("📭 Collection đã trống")


if __name__ == "__main__":
    import sys

    if "--clear" in sys.argv:
        clear_collection()

    if "--clear-only" in sys.argv:
        clear_collection()
        sys.exit(0)

    seed_database()
