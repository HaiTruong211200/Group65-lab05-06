import {
  Globe,
  MousePointerClick,
  ShieldCheck,
  Users,
  Activity,
  HelpCircle,
  Info,
} from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#002b5e] flex flex-col overflow-hidden font-sans text-white selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800/40 via-[#002b5e]/80 to-[#001a3a]"></div>
        {/* Grid lines simulation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        {/* Large faint cross */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-3xl flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-32 h-32">
            <div className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 bg-white/10 rounded-full"></div>
            <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest leading-none">
              VINMEC
            </h1>
            <p className="text-xs tracking-[0.2em] text-blue-200 mt-1">
              HEALTH SYSTEM
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full transition-all text-sm font-medium">
          <Globe className="w-4 h-4" />
          Tiếng Việt
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center">
        {/* AI Status Badge */}
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs font-bold tracking-widest text-blue-100">
            AI SYSTEM ACTIVE
          </span>
        </div>

        {/* Title */}
        <h2 className="text-6xl md:text-8xl font-black tracking-tight mb-6 drop-shadow-2xl">
          Trợ lý Y tế
          <br />
          Thông minh Vinmec
        </h2>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mb-16 font-light leading-relaxed">
          Khám phá giải pháp chăm sóc sức khỏe toàn diện được hỗ trợ bởi trí tuệ
          nhân tạo, mang lại sự an tâm và chuẩn xác.
        </p>

        {/* Call to Action Button */}
        <button
          onClick={onStart}
          className="group relative bg-white text-[#003974] px-16 py-10 rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center gap-6 hover:cursor-pointer"
        >
          <div className="absolute inset-0 bg-blue-50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MousePointerClick className="w-16 h-16 relative z-10 text-[#00509e]" />
          <span className="text-3xl font-black relative z-10 tracking-tight">
            Chạm vào màn hình để bắt đầu
          </span>
        </button>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
          <div className="flex items-center gap-3 text-blue-100/80">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">Bảo mật thông tin</span>
          </div>
          <div className="flex items-center gap-3 text-blue-100/80">
            <Users className="w-5 h-5" />
            <span className="font-medium">Đội ngũ chuyên gia</span>
          </div>
          <div className="flex items-center gap-3 text-blue-100/80">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Phân tích chuẩn xác</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-8 flex justify-between items-end">
        <div className="text-blue-200/60 text-sm">
          <p className="font-medium mb-1">Clinical Sanctuary Ecosystem v2.4</p>
          <p>© 2024 Vinmec International Hospital. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors">
            <HelpCircle className="w-5 h-5 text-blue-100" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors">
            <Info className="w-5 h-5 text-blue-100" />
          </button>
        </div>
      </footer>
    </div>
  );
}
