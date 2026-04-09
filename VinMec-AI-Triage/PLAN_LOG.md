# VinMec AI Triage — Plan Log

> **Nhóm**: Group 65  
> **Track**: Vinmec (AI Triage & Patient Experience)  
> **Ngày tạo**: 2026-04-09  
> **Trạng thái**: ✅ Hoàn thành code 4 phases

---

## Mục tiêu dự án

Xây dựng AI Agent sử dụng Gemini API để:
1. Phân tích triệu chứng → Top 3 chuyên khoa (JSON format)
2. Lưu vào MongoDB Atlas
3. Feedback flywheel (user_final_choice, handoff_triggered, user_rating)
4. RAG bằng Atlas Vector Search + Gemini Embeddings để cải thiện mô hình
5. Emergency detection bằng AI severity scoring

---

## Hiện trạng codebase

### Backend (`backend/main.py` — 103 dòng, monolithic)
- ✅ POST `/api/agent/triage` — Gemini → Top 3 khoa → MongoDB
- ✅ POST `/api/agent/feedback` — Lưu feedback
- ✅ Structured JSON output (`response_mime_type: application/json`)
- ❌ **CHƯA CÓ**: RAG, Emergency detection, Gemini Embeddings, Modular architecture

### Frontend (React + Vite + TailwindCSS v4)
- ✅ WelcomeScreen, TriageScreen, EmergencyScreen, Header
- ⚠️ **BUG**: Feedback modal không gọi API — cả nút "Có" và "Không" chỉ đóng modal
- ❌ **CHƯA CÓ**: Emergency auto-detect/redirect, RAG indicator

---

## Kiến trúc mục tiêu

```
User nhập triệu chứng
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  POST /api/agent/triage                              │
│                                                      │
│  1️⃣  Embed symptom (Gemini text-embedding-004)       │
│  2️⃣  Vector Search → tìm feedback tương tự (RAG)     │
│  3️⃣  Build augmented prompt + gọi Gemini 2.5 Flash   │
│  4️⃣  Emergency check (keyword + AI severity)         │
│  5️⃣  Save log + embedding vào MongoDB Atlas          │
│                                                      │
│  Return: {top_3, is_emergency, severity, rag_count}  │
└──────────────────────────────────────────────────────┘
    │
    ▼
Frontend: hiển thị kết quả + emergency redirect nếu cần
    │
    ▼
User chọn khoa → POST /api/agent/feedback
    → Re-embed + update MongoDB → Cải thiện RAG cho lần sau
```

### Cấu trúc thư mục backend (sau khi hoàn thành)

```
backend/
├── main.py                      # Entry point (~25 dòng)
├── config.py                    # Settings (env vars, keywords)
├── database.py                  # MongoDB Atlas connection
├── schemas.py                   # Pydantic models
├── requirements.txt             # Python dependencies
├── routers/
│   ├── __init__.py
│   ├── triage.py                # Triage endpoint + RAG + Emergency
│   └── feedback.py              # Feedback endpoint + re-embed
└── services/
    ├── __init__.py
    ├── embedding_service.py     # Gemini text-embedding-004
    ├── rag_service.py           # Vector Search + context builder
    └── emergency_service.py     # Keyword + AI severity scoring
```

---

## Plan — 4 Phases

---

### Phase 1: Backend Restructuring 🏗️

**Mục tiêu**: Tách monolithic `main.py` → modular architecture (giữ nguyên tính năng, 0 feature mới)

| Hành động | File | Mô tả |
|---|---|---|
| TẠO | `config.py` | Load `.env`, class Settings (MONGO_URI, GEMINI_API_KEY, model names) |
| TẠO | `database.py` | MongoDB client singleton, collection ref, text index fallback |
| TẠO | `schemas.py` | Pydantic: TriageRequest, TriageResponse, FeedbackRequest, FeedbackResponse |
| TẠO | `routers/__init__.py` | Package init |
| TẠO | `routers/triage.py` | Move triage logic từ main.py |
| TẠO | `routers/feedback.py` | Move feedback logic từ main.py |
| TẠO | `services/__init__.py` | Package init |
| SỬA | `main.py` | Refactor → thin entry point, mount routers |
| SỬA | `requirements.txt` | Thêm: fastapi, uvicorn, pymongo, python-dotenv, google-generativeai, pydantic |

**Verification**:
- `uvicorn main:app --reload` chạy OK
- 2 endpoints trả kết quả giống y bản cũ

**Trạng thái**: `✅ Hoàn thành`

---

### Phase 2: RAG — Vector Search + Gemini Embeddings 🧠

**Mục tiêu**: Sử dụng feedback cũ để augment prompt, cải thiện độ chính xác gợi ý

| Hành động | File | Mô tả |
|---|---|---|
| TẠO | `services/embedding_service.py` | `generate_embedding()` (RETRIEVAL_DOCUMENT) + `generate_query_embedding()` (RETRIEVAL_QUERY) dùng `text-embedding-004` |
| TẠO | `services/rag_service.py` | `retrieve_similar_feedback()` → Atlas Vector Search pipeline. `build_rag_context()` → format context string. Fallback text search nếu vector lỗi |
| SỬA | `routers/triage.py` | Thêm RAG pipeline: embed → search → build context → augmented prompt → save embedding |
| SỬA | `routers/feedback.py` | Re-embed khi user confirm khoa: `"{symptom} - Khoa: {choice}"` |
| SỬA | `schemas.py` | TriageResponse thêm `rag_feedback_count` |

**Prerequisite**: Tạo Atlas Vector Search Index trên MongoDB Atlas UI:
```json
{
  "fields": [
    { "type": "vector", "path": "symptom_embedding", "numDimensions": 768, "similarity": "cosine" },
    { "type": "filter", "path": "user_final_choice" }
  ]
}
```

**RAG Strategy**:
- Embed mỗi symptom bằng `text-embedding-004` (768 dimensions)
- Vector Search tìm top 5 cases tương tự (có user_final_choice, không bị đánh giá tiêu cực)
- Ưu tiên hiển thị corrected cases (AI sai → user sửa) vì là learning signal mạnh nhất
- Inject vào prompt trước symptom → Gemini "học" từ feedback cũ

**Verification**:
- Submit 3 triệu chứng → feedback → submit triệu chứng tương tự → verify RAG context trong prompt
- Check MongoDB: document có `symptom_embedding` (array 768 floats)

**Trạng thái**: `✅ Hoàn thành`

---

### Phase 3: Emergency Detection 🚨

**Mục tiêu**: Phát hiện triệu chứng nguy hiểm, redirect cấp cứu

| Hành động | File | Mô tả |
|---|---|---|
| TẠO | `services/emergency_service.py` | **Layer 1**: Keyword matching (20+ từ khóa, ~0ms). **Layer 2**: Gemini AI severity scoring (CRITICAL/HIGH/MEDIUM/LOW, ~1-2s) |
| SỬA | `routers/triage.py` | Gọi `check_emergency()` → thêm `is_emergency`, `severity`, `emergency_message` vào response |
| SỬA | `schemas.py` | TriageResponse thêm `is_emergency`, `emergency_message`, `severity` |
| SỬA | `config.py` | Thêm `EMERGENCY_KEYWORDS` list |

**Dual-layer design**:
```
Layer 1 (Keyword): "đau thắt ngực" → MATCH → vẫn chạy AI để lấy message chi tiết
Layer 2 (AI):      "đau đầu kinh khủng muốn ngất" → keyword MISS → AI catch → HIGH
                   "ho nhẹ 2 ngày" → keyword MISS → AI: LOW → không emergency
```

**Severity levels**:
| Level | Ý nghĩa | is_emergency |
|---|---|---|
| CRITICAL | Đe dọa tính mạng ngay | ✅ true |
| HIGH | Cần can thiệp khẩn cấp | ✅ true |
| MEDIUM | Cần khám sớm | ❌ false |
| LOW | Bình thường | ❌ false |

**Verification**:
- "khó thở dữ dội đau thắt ngực" → CRITICAL, is_emergency=true
- "ho nhẹ 2 ngày" → LOW, is_emergency=false
- "đau đầu kinh khủng muốn ngất" → HIGH, is_emergency=true (AI catch, keyword miss)

**Trạng thái**: `✅ Hoàn thành`

---

### Phase 4: Frontend Integration 🖥️

**Mục tiêu**: Fix bugs + tích hợp tính năng mới từ backend

| Hành động | File | Mô tả |
|---|---|---|
| SỬA | `TriageScreen.tsx` | **Fix bug**: Nút "Có" → `sendFeedback(dept, true)`, nút "Không" → `sendFeedback(dept, false)` |
| SỬA | `TriageScreen.tsx` | **Emergency**: Khi `is_emergency=true` → hiển thị chat đỏ + button redirect |
| SỬA | `TriageScreen.tsx` | **RAG badge**: Hiển thị "Cải thiện từ N feedback" khi `rag_feedback_count > 0` |
| SỬA | `TriageScreen.tsx` | **Severity badge**: CRITICAL/HIGH/MEDIUM/LOW trên dashboard |
| SỬA | `App.tsx` | Thêm `onEmergencyTrigger` prop → auto-redirect sang EmergencyScreen |

**Bug hiện tại** (TriageScreen.tsx line 319, 326):
```diff
- onClick={() => setSelectedSpecialty(null)}           // Chỉ đóng modal, KHÔNG gọi API
+ onClick={() => sendFeedback(selectedSpecialty!, false)} // Gọi API + đóng modal

- onClick={() => setSelectedSpecialty(null)}           // Chỉ đóng modal, KHÔNG gọi API
+ onClick={() => sendFeedback(selectedSpecialty!, true)}  // Gọi API + đóng modal
```

**Verification**:
- Feedback: Click khoa → "Có" → verify API call trong Network tab
- Emergency: Nhập "khó thở dữ dội" → thấy cảnh báo đỏ + button redirect
- RAG: Submit nhiều feedback → badge hiển thị với count

**Trạng thái**: `✅ Hoàn thành`

---

## Tổng hợp Timeline

| Phase | Nội dung | Risk | ~Thời gian |
|---|---|---|---|
| 1. Restructure | Tách main.py → modules | 🟢 Thấp | 15 phút |
| 2. RAG | Vector Search + Embeddings | 🟡 Trung bình | 30 phút |
| 3. Emergency | Keyword + AI severity | 🟢 Thấp | 20 phút |
| 4. Frontend | Fix bugs + tích hợp | 🟢 Thấp | 20 phút |
| **Tổng** | | | **~85 phút** |

---

## Open Questions (chờ review)

1. **Thứ tự Phase**: Làm tuần tự 1→2→3→4, hay skip Phase 1?
2. **MongoDB Atlas**: Đã có cluster chưa? Cần hướng dẫn setup?
3. **Emergency AI call**: Chạy song song hay tuần tự với triage call?
4. **Thêm / bỏ / sửa phase nào không?**

---
{
  "fields": [
    {
      "type": "vector",
      "path": "symptom_embedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    }
  ]
}

## Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-04-09 | Tạo plan log ban đầu — 4 phases |
| 2026-04-09 | ✅ Hoàn thành code Phase 1–4: restructure, RAG, emergency, frontend |
