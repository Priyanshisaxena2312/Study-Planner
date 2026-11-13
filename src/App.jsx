import React, { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { DashboardPage } from "./pages/DashboardPage";
import { TimetablePage } from "./pages/TimetablePage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { FocusModePage } from "./pages/FocusModePage";
import { RevisionCenterPage } from "./pages/RevisionCenterPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudyBuddyCompanion } from "./components/common/StudyBuddyCompanion";
import { Leaf } from "lucide-react";

export function App() {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  function renderPage() {
    switch (active) {
      case "Overview":
        return <DashboardPage setActive={setActive} />;
      case "My timetable":
        return <TimetablePage />;
      case "Subjects & topics":
        return <SubjectsPage />;
      case "Study goals":
        return <GoalsPage />;
      case "Focus mode":
        return <FocusModePage />;
      case "Revision center":
        return <RevisionCenterPage />;
      case "Progress & analytics":
        return <AnalyticsPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <DashboardPage setActive={setActive} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main-area">
        <Topbar
          active={active}
          onOpenMobile={() => setMobileOpen(true)}
          onSearchClick={() => setActive("Subjects & topics")}
        />

        <div className="content">
          {renderPage()}

          <footer className="footer">
            <span>
              Made for steady progress <Leaf size={13} />
            </span>
            <span>STUDYWELL · YOUR LEARNING COMPANION</span>
          </footer>
        </div>
      </main>

      {/* Floating AI Study Buddy Mascot */}
      <StudyBuddyCompanion setActivePage={setActive} />
    </div>
  );
}

export default App;

