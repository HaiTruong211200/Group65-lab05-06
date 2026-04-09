import { useState } from "react";
import Header from "./components/Header";
import TriageScreen from "./components/TriageScreen";
import EmergencyScreen from "./components/EmergencyScreen";
import WelcomeScreen from "./components/WelcomeScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "welcome" | "triage" | "emergency"
  >("welcome");

  if (currentScreen === "welcome") {
    return <WelcomeScreen onStart={() => setCurrentScreen("triage")} />;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col overflow-hidden font-sans">
      <Header
        onEmergencyClick={() => setCurrentScreen("emergency")}
        onTriageClick={() => setCurrentScreen("triage")}
        onWelcomeClick={() => setCurrentScreen("welcome")}
      />
      <main className="grow flex flex-col md:flex-row h-[calc(100vh-88px)]">
        {currentScreen === "triage" ? (
          <TriageScreen
            onEmergencyTrigger={() => setCurrentScreen("emergency")}
          />
        ) : (
          <EmergencyScreen onBack={() => setCurrentScreen("triage")} />
        )}
      </main>
    </div>
  );
}
