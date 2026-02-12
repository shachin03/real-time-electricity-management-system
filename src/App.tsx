import { useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";

type View = "landing" | "dashboard";

function App() {
  const [view, setView] = useState<View>("landing");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {view === "landing" ? (
        <LandingPage onGoToDashboard={() => setView("dashboard")} />
      ) : (
        <DashboardPage onBackToLanding={() => setView("landing")} />
      )}
    </div>
  );
}

export default App;

