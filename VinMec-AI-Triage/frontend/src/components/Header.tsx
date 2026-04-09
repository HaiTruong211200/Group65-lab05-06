import { MessageSquare, AlertTriangle } from "lucide-react";

interface HeaderProps {
  onEmergencyClick: () => void;
  onTriageClick?: () => void;
  onWelcomeClick?: () => void;
}

export default function Header({
  onEmergencyClick,
  onTriageClick,
  onWelcomeClick,
}: HeaderProps) {
  return (
    <header className="bg-slate-50 w-full top-0 px-8 py-6 z-40 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="text-2xl font-bold tracking-tighter text-blue-900 hover:cursor-pointer"
            onClick={onWelcomeClick}
          >
            Vinmec AI Triage
          </div>
          <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
              AI Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 items-center">
            <button
              onClick={onTriageClick}
              className="text-blue-700 font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity hover:cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              AI Triage
            </button>
          </nav>
          <button
            onClick={onEmergencyClick}
            className="flex items-center gap-3 bg-error text-on-error px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_0_0_rgba(186,26,26,0.7)] animate-pulse-red hover:cursor-pointer"
          >
            <AlertTriangle className="w-5 h-5 fill-current" />
            Khẩn cấp
          </button>
        </div>
      </div>
    </header>
  );
}
