import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Target,
  Timer,
  RotateCcw,
  ChartNoAxesCombined,
  Settings,
  MoreHorizontal,
  Leaf,
  Sparkles,
  X,
  GraduationCap,
} from "lucide-react";
import { useStudy } from "../../context/StudyContext";

export const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My timetable", icon: CalendarDays },
  { label: "Subjects & topics", icon: BookOpen },
  { label: "Study goals", icon: Target },
  { label: "Focus mode", icon: Timer },
  { label: "Revision center", icon: RotateCcw },
  { label: "Progress & analytics", icon: ChartNoAxesCombined },
];

export function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
  const { state } = useStudy();

  const dueRevisionsCount = state.revisions.filter((r) => !r.completed).length;

  return (
    <>
      {mobileOpen && (
        <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <button
          className="mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>

        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="brand-name">
              StudyBuddy<span>.</span>
            </div>
            <div className="brand-caption">LEARN SMARTER · GROW FASTER</div>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActive(item.label);
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.label === "Revision center" && dueRevisionsCount > 0 && (
                  <span className="nav-count">{dueRevisionsCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={17} />
            </div>
            <div className="tip-title">A gentle reminder</div>
            <p>
              Consistency matters more than intensity. Keep showing up for
              yourself.
            </p>
            <span>— YOUR STUDY COMPANION</span>
          </div>

          <button
            className={`nav-item ${active === "Settings" ? "active" : ""}`}
            onClick={() => {
              setActive("Settings");
              setMobileOpen(false);
            }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="avatar">PS</div>
            <div className="profile-copy">
              <strong>Priya Sharma</strong>
              <span>Student account</span>
            </div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>
    </>
  );
}

