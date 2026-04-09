# SPEC draft — Group

## Track: Vinmec (AI Triage & Patient Experience)

## Problem statement

Bệnh nhân đến Vinmec thường bối rối không biết nên đăng ký khám chuyên khoa nào khi có triệu chứng không rõ ràng. Hiện tại, họ phải hỏi lễ tân hoặc gọi tổng đài, mất 5-10 phút chờ đợi, trong khi lễ tân phải tra cứu thủ công. Điều này gây tắc nghẽn tại sảnh và nguy cơ chọn sai khoa dẫn đến phải khám lại, gây lãng phí thời gian và tiền bạc.

## Canvas draft

|         | Value   | Trust | Feasibility |
| ------- | ------- | ----- | ----------- |
| Trả lời | - User: |

- Bệnh nhân mới
- Người nhà
- Lễ tân (copilot)
- Pain:
  - Không hiểu triệu chứng → chọn sai khoa
  - Tắc nghẽn sảnh giờ cao điểm
- Solution:
  - AI triage + Adaptive questioning (hỏi thêm 2–3 câu)
  - Gợi ý Top 3 khoa + giải thích
- Augmentation:
  - AI hỗ trợ quyết định (human-in-the-loop)
- Extra Value:
  - Pre-visit guidance:
    - Nhịn ăn?
    - Khung giờ ít đông?
- Impact:
  - Giảm wait time
  - Tăng trải nghiệm bệnh nhân  
    |
- Risk:
  - Sai khoa
  - Miss case nguy hiểm
- Trust Design:
  - Explainability (mapping triệu chứng → khoa)
  - Confidence score
- Safety Layer:
  - Risk scoring (Low / Medium / High)
  - Detect triệu chứng nguy hiểm → redirect cấp cứu
- UX:
  - Không dùng wording “chẩn đoán”
  - Luôn có “Gặp lễ tân”
- Recovery:
  - Fallback human support
    | - Cost:
  - ~$0.005/request
- Latency:
  - <2–3s
- Architecture:
  - LLM + Rule-based safety layer
- Dependencies:
  - HIS integration
- Challenges:
  - Multi-symptom reasoning
  - Medical safety (hallucination)
    |

**Auto hay aug?** Augmentation — AI hỗ trợ tư vấn và định hướng, bệnh nhân và lễ tân là người đưa ra quyết định cuối cùng.

**Learning signal:** Ghi nhận chuyên khoa thực tế mà bệnh nhân đã khám (từ hệ thống HIS) so với gợi ý của AI để tinh chỉnh độ chính xác của Prompt.

- Data:
  - Prediction vs actual department
  - Correction từ lễ tân
- Loop:
  - Fine-tune prompt
  - Ranking model cải thiện Top-3
- Metrics:
  - Accuracy Top-1 / Top-3
  - Escalation rate

## 1. User Stories × 4 paths

**Happy Path:** Bệnh nhân nói "Tôi bị đau tức ngực và hay hụt hơi". AI hỏi thêm 1-2 câu về thâm niên hút thuốc/huyết áp, sau đó gợi ý: 1. Khoa Tim mạch (90%), 2. Khoa Nội tổng quát.khi người dùng cung cấp thông tin đủ rõ ràng, ví dụ như “tôi bị đau bụng 2 ngày nay và hơi buồn nôn”, hệ thống có thể xử lý ngay lập tức mà không cần hỏi thêm. AI sẽ trả về danh sách Top 3 chuyên khoa phù hợp kèm theo mức độ tin cậy, trong đó Nội tiêu hóa có thể đứng đầu với độ tin cậy cao, đồng thời đưa ra giải thích ngắn gọn dựa trên mối liên hệ giữa triệu chứng và hệ tiêu hóa. Người dùng sau đó có thể trực tiếp đặt lịch mà không cần thông qua lễ tân, giúp giảm đáng kể thời gian chờ và tăng trải nghiệm ban đầu. AI sẽ cung cấp các thông tin quan trọng như có cần nhịn ăn hay không, cần mang theo giấy tờ gì, hoặc khung giờ nào ít đông để tối ưu thời gian chờ.Ví dụ, nếu bệnh nhân chọn khám tiêu hóa, hệ thống có thể gợi ý nhịn ăn 6 tiếng và mang theo kết quả xét nghiệm trước đó. Điều này giúp giảm tình trạng phải quay lại nhiều lần và nâng cao trải nghiệm tổng thể.

**Low-confidence Path:** Bệnh nhân nói "Thấy không khỏe trong người". AI phản hồi: "Triệu chứng này chưa rõ ràng để xác định khoa. Bạn đang cảm thấy đau, sốt hay mệt mỏi ở vùng nào cụ thể không?".

**Failure Path (Cấp cứu):** Bệnh nhân nhập "Khó thở dữ dội, đau thắt ngực trái lan ra tay". AI nhận diện dấu hiệu nguy hiểm, ngay lập tức hiển thị hotline Cấp cứu và sơ đồ đường đi ngắn nhất tới phòng cấp cứu Vinmec thay vì gợi ý khám thường.

**Correction Path:** AI gợi ý khoa Da liễu cho mẩn ngứa. Bệnh nhân bổ sung "Tôi còn bị sưng khớp". AI lập tức điều chỉnh: "Có khả năng bạn cần khám chuyên khoa Cơ xương khớp hoặc Dị ứng miễn dịch".

## 2. Eval metrics: 3 metrics + threshold + red flag

- **Top-3 Accuracy:** $\ge 85\%$ (Chuyên khoa AI gợi ý trùng với chuyên khoa bệnh nhân thực tế đã khám). Red flag: $< 70\%$.
- **Triage Latency:** $< 30$ giây (Tổng thời gian từ lúc bắt đầu hỏi đến khi ra gợi ý). Red flag: $> 60$ giây.
- **Hand-off Rate:** $< 15\%$ (Tỷ lệ người dùng bỏ ngang để tìm lễ tân do AI không hiểu). Red flag: $> 30\%$.

## 3. Top 3 failure modes (Trigger / Hậu quả / Mitigation)

**Trigger:** Bệnh nhân dùng từ lóng hoặc mô tả cảm giác mơ hồ (vd: "thấy nhộn nhạo", "đau mỏ ác").  
**Hậu quả:** AI phân loại sai khoa.  
**Mitigation:** Sử dụng RAG (Retrieval-Augmented Generation) kết nối với bộ từ điển y khoa dân gian để chuẩn hóa thuật ngữ.

**Trigger:** Bệnh nhân có nhiều bệnh nền phức tạp.  
**Hậu quả:** AI đưa ra quá nhiều gợi ý gây hoang mang.  
**Mitigation:** Ưu tiên gợi ý khoa Nội tổng quát nếu các triệu chứng xuất hiện ở nhiều cơ quan khác nhau.

**Trigger:** Lỗi kết nối hệ thống (API Timeout).  
**Hậu quả:** Chatbot ngưng hoạt động tại Kiosk.  
**Mitigation:** Chuyển sang danh mục chuyên khoa tĩnh (Static Menu) thường gặp để bệnh nhân tự chọn.

## 4. ROI 3 kịch bản

**Conservative:** Giảm 10% thời gian chờ đợi tại quầy lễ tân. Tiết kiệm nhân lực trực tổng đài giải đáp thắc mắc cơ bản.

**Realistic:** Giảm 30% tình trạng "khám nhầm khoa". Tăng tỷ lệ hài lòng của bệnh nhân (NPS) lên 15%.

**Optimistic:** Tự động hóa hoàn toàn luồng đặt lịch cho 60% bệnh nhân mới. Dữ liệu triệu chứng từ AI giúp bác sĩ có thông tin sơ bộ trước khi bệnh nhân vào phòng khám.

## 5. Phân công

- **Trang:** Thiết kế Canvas & Phân tích Failure modes.
- **Hải:** Xây dựng kịch bản chi tiết cho 4 User Stories.
- **Việt Anh:** Định nghĩa Eval metrics & Tính toán bài toán kinh tế ROI.
