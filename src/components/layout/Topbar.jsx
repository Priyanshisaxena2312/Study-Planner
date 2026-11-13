import React, { useState } from "react";
import { Menu, Sun, Search, Bell, X, Check, Sparkles } from "lucide-react";
import { useStudy } from "../../context/StudyContext";

export function Topbar({ active, onOpenMobile, onSearchClick }) {
  const { state, dispatch } = useStudy();
  const [showNotificationList, setShowNotificationList] = useState(false);

  const pendingRevisions = state.revisions.filter((r) => !r.completed);
  const mascotEnabled = state.settings.mascotEnabled ?? true;

  function toggleMascot() {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { mascotEnabled: !mascotEnabled },
    });
  }

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      <div className="breadcrumb">
        Workspace <span>/</span> <strong>{active}</strong>
      </div>

      <div className="top-actions">
        {/* Study Buddy Mascot Presence Toggle */}
        <button
          className={`buddy-topbar-pill ${mascotEnabled ? "active" : "inactive"}`}
          onClick={toggleMascot}
          title={mascotEnabled ? "Click to hide floating Study Buddy" : "Click to show floating Study Buddy"}
        >
          <Sparkles size={13} />
          <span>Buddy: {mascotEnabled ? "ON" : "OFF"}</span>
        </button>

        <div className="today-pill">
          <Sun size={15} /> Thursday, 13 November
        </div>

        <button
          className="icon-button"
          aria-label="Search"
          onClick={onSearchClick}
          title="Quick search"
        >
          <Search size={18} />
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="icon-button notification"
            aria-label="Notifications"
            onClick={() => setShowNotificationList(!showNotificationList)}
            title="Notifications"
          >
            <Bell size={18} />
            {pendingRevisions.length > 0 && <i />}
          </button>

          {showNotificationList && (
            <div className="notification-dropdown">
              <div className="dropdown-head">
                <strong>Notifications</strong>
                <button
                  className="icon-button-sm"
                  onClick={() => setShowNotificationList(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="dropdown-body">
                {pendingRevisions.length === 0 ? (
                  <div className="dropdown-empty">All caught up! No overdue reviews.</div>
                ) : (
                  pendingRevisions.slice(0, 4).map((rev) => (
                    <div className="dropdown-item" key={rev.id}>
                      <div className="item-bullet" />
                      <div>
                        <strong>{rev.subject}: {rev.topic}</strong>
                        <span>Due {rev.dueDate} (Stage {rev.stage})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="top-avatar" title="Priya Sharma">
          PS
        </div>
      </div>
    </header>
  );
}

