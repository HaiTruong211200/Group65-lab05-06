# Prototype — AI triage Vinmec

## Mô tả

Chatbot hỏi bệnh nhân 3-5 câu về triệu chứng, gợi ý top 3 chuyên khoa phù hợp
kèm confidence score. Bệnh nhân chọn hoặc gặp lễ tân.

## Level: Mock prototype

- UI build bằng Stitch + Google AI Studio (HTML/CSS/JS)
- 1 flow chính chạy thật với Gemini API: nhập triệu chứng → nhận gợi ý khoa → người dùng feedback → lưu lại data

## Links

- Prototype: https://claude.site/artifacts/xxx
- Prompt test log: xem file `prototype/prompt-tests.md`
- Video demo (backup): https://drive.google.com/xxx

## Tools

- UI: Stitch + Google AI Studio
- AI: Google Gemini 2.0 Flash (via Google AI Studio)
- Prompt: system prompt + few-shot examples cho 10 triệu chứng phổ biến

## Phân công

| Thành viên | Phần                                                      | Output                                                                      |
| ---------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| Hải        | Eval metrics + ROI + failure modes + User stories 4 paths | spec/spec-final.md phần 2, 3, 4, 5                                          |
| Việt Anh   | UI prototype + demo script + prompt engineering           | prototype/, demo/demo-script.md, prototype/prompt-tests.md                  |
| Trang      | Canvas + AI flow + demo slides                            | spec/spec-final.md phần 1, prototype/, demo/demo-script.md, demo/slides.pdf |
