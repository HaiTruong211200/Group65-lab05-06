**Failure nguy hiểm nhất là khi AI sai nhưng bệnh nhân không biết mình đang bị sai.**

## Top 3 Failure Modes

| #     | Trigger                                                                                              | Hậu quả                                                           | Mitigation                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **1** | **AI bỏ sót triệu chứng cấp cứu** do user mô tả không chuẩn (_“khó chịu ngực”, “mệt không thở nổi”_) | Bệnh nhân đi sai khoa, chậm cấp cứu → risk patient safety rất cao | Rule-based emergency override + symptom tree follow-up + recall target ≥98% cho red flags         |
| **2** | **Triệu chứng đa cơ quan / nhiều bệnh nền** khiến AI trả quá nhiều khoa                              | User hoang mang, chọn bừa → tăng tỷ lệ khám sai khoa              | Ưu tiên **Nội tổng quát** + nút handoff lễ tân + explain “vì triệu chứng liên quan nhiều cơ quan” |
| **3** | **API timeout / kiosk mất mạng** tại giờ cao điểm                                                    | Kiosk đứng, user bỏ sang hỏi lễ tân → queue tăng mạnh             | Fallback menu chuyên khoa tĩnh + local cache symptom tree + auto retry background                 |

---

## Failure nguy hiểm nhất

> **AI miss case cấp cứu nhưng user không nhận ra**

### Cascade failure

```text
AI miss red-flag
→ User đi sai khoa
→ Chờ khám thường
→ Bác sĩ không đúng chuyên môn
→ Delay cấp cứu
→ Safety incident
→ Mất niềm tin hệ thống


# Failure Analysis & ROI - AI Triage

## Failure Assessment

- **Severity:** rất cao
- **Likelihood:** trung bình
- **Priority:** FIX NGAY

---

## Severity × Likelihood Matrix

```

            Likelihood thấp          Likelihood cao
          ┌────────────────────┬────────────────────┐

Severity │ API timeout │ Miss cấp cứu │
cao │ (monitor) │ FIX NGAY │
├────────────────────┼────────────────────┤
Severity │ User typo │ Multi-symptom │
thấp │ (accept) │ Fix sớm │
└────────────────────┴────────────────────┘

```

---

## Adversarial / Misuse

| Scenario | Hậu quả | Phòng tránh |
| :--- | :--- | :--- |
| User troll nhập triệu chứng giả | Làm bẩn feedback loop | Chỉ học từ HIS final department |
| Spam request kiosk | Tăng cost, lag hệ thống | Rate limit theo session |
| User dùng output AI như chẩn đoán | Self-diagnosis nguy hiểm | UI disclaimer: đây chỉ là định hướng chuyên khoa, không phải chẩn đoán |

---
```
