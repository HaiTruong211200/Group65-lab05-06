# SPEC draft — Group

## Track: Vinmec (AI Triage & Patient Experience)

## Problem statement

Bệnh nhân đến Vinmec thường bối rối không biết nên đăng ký khám chuyên khoa nào khi có triệu chứng không rõ ràng. Hiện tại, họ phải hỏi lễ tân hoặc gọi tổng đài, mất 5-10 phút chờ đợi, trong khi lễ tân phải tra cứu thủ công. Điều này gây tắc nghẽn tại sảnh và nguy cơ chọn sai khoa dẫn đến phải khám lại, gây lãng phí thời gian và tiền bạc.

## Canvas draft

|         | Value                                                                                                                                   | Trust                                                                                                            | Feasibility                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Trả lời | Bệnh nhân mới/vãng lai. Pain: Chờ đợi lâu, khám sai khoa. AI gợi ý: Phân tích triệu chứng tự nhiên để đưa ra Top 3 chuyên khoa phù hợp. | Sai khoa gây tốn tiền/thời gian. Cần giải thích lý do gợi ý và luôn có nút "Gặp lễ tân" để đảm bảo an toàn y tế. | API LLM có chi phí thấp (~$0.005/lượt). Thách thức: Xử lý các triệu chứng đa tầng hoặc từ ngữ địa phương. |

**Auto hay aug?** Augmentation — AI hỗ trợ tư vấn và định hướng, bệnh nhân và lễ tân là người đưa ra quyết định cuối cùng.

**Learning signal:** Ghi nhận chuyên khoa thực tế mà bệnh nhân đã khám (từ hệ thống HIS) so với gợi ý của AI để tinh chỉnh độ chính xác của Prompt.

## 1. User Stories × 4 paths

**Happy Path:** Bệnh nhân nói "Tôi bị đau tức ngực và hay hụt hơi". AI hỏi thêm 1-2 câu về thâm niên hút thuốc/huyết áp, sau đó gợi ý: 1. Khoa Tim mạch (90%), 2. Khoa Nội tổng quát.

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
