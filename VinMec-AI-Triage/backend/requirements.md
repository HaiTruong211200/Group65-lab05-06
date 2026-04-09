# AI20K Agent - VinMec AI Triage

Tôi muốn xây một ứng dụng AI Agent sử dụng Gemini API với khả năng:

1. Phân tích triệu chứng sau và trả về Top 3 chuyên khoa phù hợp nhất.
2. Bắt buộc trả về đúng định dạng JSON này:
        "{{"top_3": [{{"department": "tên khoa", "confidence": số_từ_1_đến_100}}]}}
        Triệu chứng của bệnh nhân: "{request.symptom}"
3. Lưu vào MongoDB:
4. Cập nhật lại feedback từ khách hàng để cải thiện mô hình:
        - user_final_choice: chuyên khoa mà user chọn
        - handoff_triggered: true nếu user chọn handoff
        - user_rating: đánh giá của user
5. Sử dụng RAG để truy xuất thông tin từ feedback lưu lại để cải thiện mô hình 
6. Cuộc gọi khẩn cấp khi tình trạng user đang yếu đi hoặc có dấu hiệu nguy hiểm
7. RAG Strategy: Atlas → Vector Search + Gemini Embeddings (chính xác hơn cho tiếng Việt) Emergency detection: AI severity scoring bằng Gemini (chính xác hơn nhưng +1-2s latency)
