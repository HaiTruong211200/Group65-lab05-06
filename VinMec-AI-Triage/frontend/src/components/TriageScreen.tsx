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
  Sparkles,
  Siren,
} from "lucide-react";

type Message = {
  id: string;
  role: "ai" | "user" | "emergency";
  text: string;
  time: string;
};

interface TriageScreenProps {
  onEmergencyTrigger: () => void;
}

const API_BASE_URL = "http://127.0.0.1:8000";
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Chào bạn, bạn đang cảm thấy không khỏe ở đâu?",
    time: "Vừa xong",
  },
];

export default function TriageScreen({
  onEmergencyTrigger,
}: TriageScreenProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [aiResult, setAiResult] = useState<any>(null);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );
  const [emergencyInfo, setEmergencyInfo] = useState<{
    is_emergency: boolean;
    emergency_message: string;
    severity: string;
  } | null>(null);
  const [ragFeedbackCount, setRagFeedbackCount] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. Triage API call
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
    setFeedbackSent(false);

    try {
      // Include recent conversation history so backend can use it in the prompt
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const response = await axios.post(`${API_BASE_URL}/api/agent/triage`, {
        symptom: userText,
        history: historyPayload,
      });

      const {
        log_id,
        result,
        is_emergency,
        emergency_message,
        severity,
        rag_feedback_count,
      } = response.data;

      setCurrentLogId(log_id);
      setAiResult(result);
      setRagFeedbackCount(rag_feedback_count || 0);
      setEmergencyInfo({ is_emergency, emergency_message, severity });

      if (is_emergency) {
        // Emergency — show red alert in chat
        const emergencyMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "emergency",
          text:
            emergency_message ||
            "⚠️ Phát hiện dấu hiệu nguy hiểm! Vui lòng gọi Cấp cứu NGAY.",
          time: "Vừa xong",
        };
        setMessages((prev) => [...prev, emergencyMsg]);
      } else {
        const newAiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: result?.message
            ? result.message
            : result?.question
              ? result?.question
              : "Tôi đã phân tích xong triệu chứng của bạn. Vui lòng xem gợi ý chuyên khoa ở bảng bên phải.",
          time: "Vừa xong",
        };
        setMessages((prev) => [...prev, newAiMsg]);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          role: "ai",
          text: "Lỗi kết nối server. Vui lòng thử lại sau.",
          time: "Vừa xong",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 2. Feedback API call (FIXED — previously not calling API)
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
      setFeedbackSent(true);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-400 text-gray-900";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
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
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "items-end self-end" : "items-start"
              }`}
            >
              <div
                className={
                  msg.role === "user"
                    ? "bg-secondary-container p-6 rounded-3xl"
                    : msg.role === "emergency"
                      ? "bg-red-50 border-2 border-red-400 p-6 rounded-3xl shadow-lg animate-pulse"
                      : "bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-3xl shadow-sm"
                }
              >
                {msg.role === "emergency" && (
                  <div className="flex items-center gap-2 mb-3">
                    <Siren className="w-6 h-6 text-red-600" />
                    <span className="text-red-700 font-black text-sm uppercase tracking-wider">
                      CẢNH BÁO KHẨN CẤP
                    </span>
                  </div>
                )}
                <p
                  className={`text-xl leading-relaxed ${
                    msg.role === "user"
                      ? "text-on-secondary-container font-medium"
                      : msg.role === "emergency"
                        ? "text-red-800 font-bold"
                        : "text-on-surface"
                  }`}
                >
                  {msg.text}
                </p>
                {msg.role === "emergency" && (
                  <button
                    onClick={onEmergencyTrigger}
                    className="mt-4 w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-red-700 active:scale-[0.98] transition-all"
                  >
                    <AlertTriangle className="w-6 h-6 fill-current" />
                    GỌI CẤP CỨU NGAY
                  </button>
                )}
              </div>
              <span
                className={`text-sm text-on-surface-variant mt-2 ${msg.role === "user" ? "mr-4" : "ml-4"}`}
              >
                {msg.role === "user"
                  ? "Bạn"
                  : msg.role === "emergency"
                    ? "⚠️ Hệ thống"
                    : "AI Vinmec"}{" "}
                • {msg.time}
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
                AI Vinmec đang phân tích...
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
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-primary w-8 h-8" />
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Phân tích Chuyên khoa
            </h2>
          </div>

          {/* RAG indicator */}
          {ragFeedbackCount > 0 && (
            <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Gợi ý được cải thiện từ {ragFeedbackCount} feedback trước đó
              </span>
            </div>
          )}

          {/* Severity Badge */}
          {emergencyInfo &&
            emergencyInfo.severity !== "NORMAL" &&
            emergencyInfo.severity !== "LOW" && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${getSeverityColor(emergencyInfo.severity)}`}
              >
                <AlertTriangle className="w-4 h-4" />
                Mức độ: {emergencyInfo.severity}
              </div>
            )}

          <div className="space-y-6">
            {aiResult ? (
              aiResult.top_3?.map((item: any, index: number) => (
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
                      className="h-full bg-gradient-to-r from-primary to-blue-300 transition-all duration-700"
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

          {/* Feedback sent confirmation */}
          {feedbackSent && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Cảm ơn bạn! Feedback đã được ghi nhận để cải thiện AI.
              </span>
            </div>
          )}

          {/* Emergency Panel */}
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
              onClick={() => {
                sendFeedback("CẤP CỨU", false, true);
                onEmergencyTrigger();
              }}
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

      {/* Feedback Modal — FIXED: now actually calls API */}
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
                onClick={() => sendFeedback(selectedSpecialty!, false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-error bg-error/10 hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5" />
                Không
              </button>
              <button
                onClick={() => sendFeedback(selectedSpecialty!, true)}
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
