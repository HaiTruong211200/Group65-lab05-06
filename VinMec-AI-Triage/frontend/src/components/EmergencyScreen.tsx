import {
  MapPin,
  AlertTriangle,
  ArrowLeft,
  HeartPulse,
  Wind,
  UserX,
} from "lucide-react";

interface EmergencyScreenProps {
  onBack: () => void;
}

export default function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  return (
    <div className="relative w-full h-full flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8 bg-surface-bright overflow-y-auto">
      {/* Background Aesthetic Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-error-container rounded-full blur-[120px]"></div>
      </div>

      {/* Left Column: Primary Emergency Actions */}
      <div className="flex-1 flex flex-col justify-center items-center gap-8 md:gap-12 z-10 py-4">
        {/* Location Indicator Card */}
        <div className="bg-surface-container-lowest px-8 py-4 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-300">
          <MapPin className="text-primary w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-sm font-medium">
              Bạn đang ở:
            </span>
            <span className="text-on-surface font-bold text-xl">
              Sảnh chính - Tòa nhà A
            </span>
          </div>
        </div>

        {/* Massive Pulse Emergency Button */}
        <div className="relative flex flex-col items-center">
          <button className="animate-pulse-red bg-error text-on-error w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center gap-4 hover:opacity-90 active:scale-95 transition-all shadow-2xl border-none shrink-0">
            <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 fill-current" />
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase px-8 text-center leading-tight">
              GỌI CẤP CỨU NGAY
            </span>
          </button>

          {/* Status Message */}
          <div className="mt-8 md:mt-12 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-size-[200%_auto] animate-[shimmer_3s_linear_infinite]">
                Hệ thống đang kết nối...
              </span>
            </div>
            <p className="text-on-surface-variant text-base md:text-lg max-w-md">
              Vui lòng đứng yên tại chỗ, nhân viên y tế sẽ đến trong giây lát.
            </p>
          </div>
        </div>

        {/* Cancel/Back Action */}
        <button
          onClick={onBack}
          className="bg-surface-container-low hover:bg-surface-container hover:text-on-surface text-on-surface-variant px-8 md:px-12 py-3 md:py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
      </div>

      {/* Right Column: First Aid Instructions (Sidebar) */}
      <aside className="w-full md:w-100 bg-surface-container-lowest/70 backdrop-blur-xl rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl z-10 shrink-0 h-fit md:h-full md:overflow-y-auto">
        <div className="flex flex-col gap-2 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-on-surface">
            Hướng dẫn sơ cứu nhanh
          </h2>
          <div className="h-1.5 w-16 bg-primary rounded-full"></div>
        </div>

        <div className="space-y-4 md:space-y-6 shrink-0">
          {/* Instruction Card 1 */}
          <div className="bg-surface-container-low p-4 md:p-6 rounded-xl flex gap-4 md:gap-5 items-start">
            <div className="bg-primary-container p-2 md:p-3 rounded-lg text-white shrink-0">
              <HeartPulse className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base md:text-lg text-on-surface">
                Đau ngực
              </h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                Để bệnh nhân ngồi nghỉ, nới lỏng quần áo và giữ bình tĩnh.
              </p>
            </div>
          </div>

          {/* Instruction Card 2 */}
          <div className="bg-surface-container-low p-4 md:p-6 rounded-xl flex gap-4 md:gap-5 items-start">
            <div className="bg-primary-container p-2 md:p-3 rounded-lg text-white shrink-0">
              <Wind className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base md:text-lg text-on-surface">
                Khó thở
              </h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                Giúp bệnh nhân ngồi tựa lưng, tạo không gian thoáng khí xung
                quanh.
              </p>
            </div>
          </div>

          {/* Instruction Card 3 */}
          <div className="bg-surface-container-low p-4 md:p-6 rounded-xl flex gap-4 md:gap-5 items-start">
            <div className="bg-primary-container p-2 md:p-3 rounded-lg text-white shrink-0">
              <UserX className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base md:text-lg text-on-surface">
                Mất ý thức
              </h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                Đặt nằm nghiêng an toàn, kiểm tra nhịp thở và không để vật cản ở
                miệng.
              </p>
            </div>
          </div>
        </div>

        {/* Supplemental Image Decor */}
        <div className="mt-auto overflow-hidden rounded-xl bg-surface-container h-32 md:h-48 relative shrink-0">
          <img
            alt="Hospital interior corridor"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg0-PtLuTJ3CnAI77vbJqWNfbzo6BM0ANjJxJKj3Z873jMBQ4-V0mQhpF-Zre-vVgJAC6LH90ZqO3Dhk4EyUA2gr0g1X_efL9Cj30lb9IbqmALlLUdoj_KRCo55x5_wsPUrdkakVL_ocTHP6KSr40mP-gS8MOK-SIOU0PDWupwPoVU3-YiKnEmUvQtHYskLvVx4vfY0YFYNo2SL67aU4yjUzNYMw_cAVaHma72SvL4qfWNritkIEhV3_W25VgBEj-dCW-6_gAF-BU"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-xs md:text-sm font-bold text-primary">
            Đội ngũ phản ứng nhanh Vinmec luôn sẵn sàng 24/7.
          </div>
        </div>
      </aside>
    </div>
  );
}
