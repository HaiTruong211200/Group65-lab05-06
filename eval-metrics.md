# Eval Metrics + Threshold — Vinmec AI Triage

## Precision hay Recall?

☐ Precision  
☑ Recall — ưu tiên phát hiện đầy đủ các ca cần đúng chuyên khoa, đặc biệt là **ca nguy hiểm / cấp cứu**

### Tại sao chọn Recall-first?

Trong bài toán **medical triage**, false negative nguy hiểm hơn false positive.

- Nếu AI **bỏ sót triệu chứng nguy hiểm** → bệnh nhân có thể vào sai khoa hoặc chậm cấp cứu
- Nếu AI gợi ý thêm 1–2 khoa dư (false positive) → user vẫn có thể chọn đúng hoặc được lễ tân sửa
- Vì vậy cần tối ưu:
  - **Recall cao cho triệu chứng red flag**
  - **Top-3 coverage cao cho chuyên khoa**

### Nếu sai ngược lại thì sao?

Nếu optimize precision quá mạnh:

- AI sẽ quá thận trọng
- Hay từ chối trả lời
- Handoff lễ tân tăng cao
- Trải nghiệm chậm
- Không đạt mục tiêu giảm tải front desk

---

## Metrics Table

| Metric                                     | Threshold | Red flag (dừng khi) |
| ------------------------------------------ | --------: | ------------------: |
| **Red-flag Recall** (phát hiện ca cấp cứu) | **≥ 98%** |           **< 95%** |
| **Top-3 Department Accuracy**              | **≥ 85%** |           **< 70%** |
| **Triage Latency**                         | **< 30s** |           **> 60s** |

---

## Metric 1 — Red-flag Recall (quan trọng nhất)

### Định nghĩa

Tỷ lệ AI **không bỏ sót** các ca có dấu hiệu nguy hiểm:

- đau ngực lan tay
- khó thở dữ dội
- méo miệng / yếu nửa người
- sốt co giật
- đau bụng cấp dữ dội

### Threshold

- **Target:** ≥98%
- **Red flag:** <95%

### Vì sao critical?

Đây là **safety metric số 1**.  
Chỉ cần bỏ sót vài ca:

- ảnh hưởng patient safety
- mất niềm tin
- risk rất lớn cho bệnh viện

---

## Metric 2 — Top-3 Department Accuracy

### Định nghĩa

Khoa bệnh nhân **thực tế khám trong HIS** có nằm trong **Top 3 AI gợi ý hay không**.

### Threshold

- **Target:** ≥85%
- **Red flag:** <70%

### Ý nghĩa product

Metric này đo:

- AI có hiểu symptom language thật không
- symptom ontology có đủ tốt không
- mapping khoa có đúng với workflow bệnh viện không

---

## Metric 3 — Triage Latency

### Định nghĩa

Tổng thời gian từ:
**user nhập triệu chứng → follow-up → AI trả Top-3**

### Threshold

- **Target:** <30 giây
- **Red flag:** >60 giây

### Vì sao quan trọng?

Dù AI đúng nhưng quá chậm:

- user bỏ kiosk
- quay lại hỏi lễ tân
- không giảm được queue

---

## User-facing vs Internal Metrics

| Metric             | User thấy?       | Dùng để làm gì                  |
| ------------------ | ---------------- | ------------------------------- |
| Confidence level   | ☑ Có             | Chỉ hiện khi >70% để tăng trust |
| Triage latency     | ☐ Không          | Internal theo dõi UX speed      |
| Correction rate    | ☐ Không          | Đo chất lượng routing           |
| Emergency override | ☐ Không          | Theo dõi safety                 |
| Hand-off rate      | ☑ Có (gián tiếp) | UX nút “Gặp lễ tân”             |

---

## Offline Eval vs Online Eval

| Loại                 | Khi nào      | Đo gì                          | Ví dụ                           |
| -------------------- | ------------ | ------------------------------ | ------------------------------- |
| **Offline**          | Trước deploy | Accuracy trên symptom test set | 1,000 case lịch sử từ HIS       |
| **Online**           | Sau deploy   | User behavior thật             | User có follow suggestion không |
| **Safety eval**      | Liên tục     | Recall nhóm red flag           | Case cấp cứu bị miss            |
| **Operational eval** | Sau deploy   | Queue reduction                | Giảm thời gian chờ quầy         |

---

## A/B Test Design

| Test                       | Variant A        | Variant B      | Metric                       | Expected                            |
| -------------------------- | ---------------- | -------------- | ---------------------------- | ----------------------------------- |
| Hiển thị confidence        | Có % confidence  | Không hiện     | Trust score, correction rate | Có confidence → ít correction hơn   |
| 1 follow-up vs 2 follow-up | 1 câu hỏi        | 2 câu hỏi      | Accuracy vs latency          | 2 câu tăng accuracy nhưng phải <30s |
| Static menu fallback       | Có fallback menu | Không fallback | Drop-off rate                | Có fallback → ít bỏ kiosk           |

---

## Nếu chỉ chọn 1 metric duy nhất

> **Red-flag Recall**

Vì đây là bài toán healthcare:

- safety > convenience
- miss cấp cứu là failure nghiêm trọng nhất
- đây là metric không được phép compromise

---

## Kill Criteria

Dừng rollout hoặc rollback nếu xảy ra một trong các điều kiện:

- **Red-flag recall <95%**
- Có **≥1 case cấp cứu bị miss nghiêm trọng**
- Latency >60s liên tục 3 ngày
- Handoff >40%
- User drop-off tại kiosk >35%

---

## Success Definition

> **Không bỏ sót ca nguy hiểm, bệnh nhân vào đúng khoa nhanh hơn, và giảm tải lễ tân rõ rệt.**
