## 06. ROI — 3 Scenarios

**Mục tiêu:** giảm tải lễ tân, giảm khám nhầm khoa, tăng patient satisfaction.

### ROI Table

|            | Conservative                                      | Realistic                         | Optimistic                         |
| :--------- | :------------------------------------------------ | :-------------------------------- | :--------------------------------- |
| Assumption | 200 bệnh nhân/ngày, 30% adoption                  | 500 bệnh nhân/ngày, 60% adoption  | 1000 bệnh nhân/ngày, 75% adoption  |
| Cost       | $20/ngày                                          | $45/ngày                          | $80/ngày                           |
| Benefit    | Tiết kiệm 25 giờ lễ tân/tháng + giảm 5% khám nhầm | 70 giờ/tháng + giảm 20% khám nhầm | 150 giờ/tháng + giảm 35% khám nhầm |
| Net        | +$80/ngày                                         | +$250/ngày                        | +$600/ngày                         |

---

## Assumptions chi tiết

### Cost

Bao gồm:

- API inference triage
- kiosk hosting / backend
- monitoring
- correction log
- HIS integration maintenance

### Benefit

Quy đổi từ:

- giảm thời gian hỏi lễ tân (5–10 phút/user)
- giảm khám sai khoa
- tăng throughput phòng khám
- tăng NPS → retention dài hạn

---

## Time-to-Value

- **Tuần 1–2:** User làm quen kiosk, benefit thấp
- **Tuần 3–4:** Giảm queue quầy tiếp đón
- **Tháng 2+:** HIS feedback loop giúp accuracy tăng
- **Tháng 3+:** ROI rõ nhờ giảm khám nhầm khoa

---

## Competitive Moat

Đây là bài toán có **data moat mạnh**.

### Vì sao?

- symptom phrasing của bệnh nhân Việt rất riêng
- từ dân gian:
  - “đau mỏ ác”
  - “nhộn nhạo”
  - “tức ngực như đè đá”
- HIS final department là ground truth cực giá trị

Càng nhiều patient flow → càng nhiều correction → model càng tốt

### Competitor khó copy nếu không có:

- patient symptom logs
- department mapping thật
- workflow bệnh viện

---

## Kill Criteria

Dừng rollout nếu:

- Conservative ROI âm 2 tháng liên tục
- Adoption <30%
- Handoff >40%
- Red-flag recall <95%
- Queue front desk không giảm sau 6 tuần
