import React from "react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  time: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Chào bạn, bạn đang cảm thấy không khỏe ở đâu?",
    time: "Vừa xong",
  },
];

export default function TriageScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Quan trọng: Lưu kết quả AI và log_id từ backend
  const [aiResult, setAiResult] = useState<any>(null);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Hàm gọi API Triage (Khi nhấn Gửi)
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      time: "Vừa xong",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/agent/triage`, {
        symptom: userText,
      });

      const { log_id, result } = response.data;

      // Cập nhật State để hiển thị cột bên phải
      setCurrentLogId(log_id);
      setAiResult(result);

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Tôi đã phân tích xong triệu chứng của bạn. Vui lòng xem gợi ý chuyên khoa ở bảng bên phải.",
        time: "Vừa xong",
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      // Fallback nếu server sập
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          role: "ai",
          text: "Lỗi kết nối server...",
          time: "Vừa xong",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 2. Hàm gửi Feedback (Khi nhấn Có/Không hoặc chọn Khoa)
  const sendFeedback = async (
    specialty: string,
    rating: boolean | null = null,
    handoff: boolean = false,
  ) => {
    if (!currentLogId) return;

    try {
      await axios.post(`${API_BASE_URL}/api/agent/feedback`, {
        log_id: currentLogId,
        user_final_choice: specialty,
        handoff_triggered: handoff,
        user_rating: rating,
      });
      console.log("Flywheel: Đã lưu feedback thành công!");
    } catch (error) {
      console.error("Lỗi lưu feedback:", error);
    }
    setSelectedSpecialty(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {/* Left Column (60%): Chat interface */}
      <section className="w-full md:w-[60%] bg-surface-container-lowest flex flex-col relative overflow-hidden">
        <div className="px-12 pt-10 pb-6 border-b border-outline-variant/5">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Vui lòng mô tả triệu chứng của bạn
          </h1>
          <p className="text-on-surface-variant mt-2 text-lg">
            Hệ thống AI đang lắng nghe và phân tích tình trạng của bạn.
          </p>
        </div>

        {/* Chat Content */}
        <div className="flex-grow overflow-y-auto px-12 py-6 flex flex-col gap-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end self-end" : "items-start"}`}
            >
              <div
                className={
                  msg.role === "user"
                    ? "bg-secondary-container p-6 rounded-3xl"
                    : "bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-3xl shadow-sm"
                }
              >
                <p
                  className={`text-xl leading-relaxed ${msg.role === "user" ? "text-on-secondary-container font-medium" : "text-on-surface"}`}
                >
                  {msg.text}
                </p>
              </div>
              <span
                className={`text-sm text-on-surface-variant mt-2 ${msg.role === "user" ? "mr-4" : "ml-4"}`}
              >
                {msg.role === "user" ? "Bạn" : "AI Vinmec"} • {msg.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-3xl shadow-sm flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span className="text-sm text-on-surface-variant mt-2 ml-4">
                AI Vinmec đang gõ...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-8 bg-surface-container-lowest border-t border-outline-variant/5">
          <div className="max-w-4xl mx-auto flex gap-4 items-center bg-surface-container-low p-4 rounded-3xl focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              className="flex-grow bg-transparent border-none focus:ring-0 text-xl px-4 py-2 placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Nhập câu trả lời của bạn..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Gửi</span>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Right Column (40%): Results Dashboard */}
      <section className="w-full md:w-[40%] bg-surface-container-low flex flex-col border-l border-outline-variant/10">
        <div className="p-10 flex-grow overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-primary w-8 h-8" />
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Phân tích Chuyên khoa
            </h2>
          </div>

          <div className="space-y-6">
            {aiResult ? (
              aiResult.top_3.map((item: any, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedSpecialty(item.department)}
                  className={`p-8 rounded-3xl shadow-sm border cursor-pointer hover:shadow-md transition-all active:scale-[0.98] ${
                    index === 0
                      ? "bg-surface-container-lowest border-primary/20"
                      : "bg-surface-container-lowest/60 border-outline-variant/10"
                  }`}
                >
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3
                        className={`text-2xl font-extrabold ${index === 0 ? "text-primary" : "text-on-surface"}`}
                      >
                        {item.department}
                      </h3>
                      <p className="text-on-surface-variant font-medium">
                        {index === 0
                          ? "Ưu tiên khám ngay"
                          : "Lựa chọn thay thế"}
                      </p>
                    </div>
                    <span className="text-4xl font-black text-primary">
                      {item.confidence}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-300"
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-on-surface-variant opacity-50">
                Đang chờ triệu chứng...
              </p>
            )}
          </div>

          {/* Nút Cấp cứu: Tích hợp Handoff Trigger */}
          <div className="mt-10 p-8 rounded-3xl bg-error-container/20 border-2 border-error/20 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-error">
              <AlertTriangle className="w-8 h-8 fill-current" />
              <h4 className="text-xl font-bold">CẢNH BÁO KHẨN CẤP</h4>
            </div>
            <p className="text-on-surface leading-relaxed font-medium">
              Nếu tình trạng đang chuyển biến xấu, ĐỪNG TIẾP TỤC CHAT.
            </p>
            <button
              className="w-full bg-error text-on-error py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => sendFeedback("CẤP CỨU", false, true)}
            >
              <AlertTriangle className="w-8 h-8 fill-current" />
              GỌI CẤP CỨU NGAY
            </button>
          </div>
        </div>

        <footer className="p-8 border-t border-outline-variant/10">
          <div className="flex items-center gap-4 text-on-surface-variant opacity-60">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">
              Hệ thống AI được chứng nhận bởi Vinmec
            </span>
          </div>
        </footer>
      </section>

      {/* Feedback Modal */}
      {selectedSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedSpecialty(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Activity className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-on-surface mb-2">
              Đánh giá gợi ý
            </h3>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Gợi ý khám <strong>{selectedSpecialty}</strong> có hữu ích với bạn
              không?
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-error bg-error/10 hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5" />
                Không
              </button>
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-5 h-5" />
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
