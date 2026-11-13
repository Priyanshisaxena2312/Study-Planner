import React from "react";

export function StatCard({ icon, label, value, note, accent = "green", onClick, clickable = false }) {
  return (
    <div
      className={`stat-card ${clickable ? "clickable-stat" : ""}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className={`stat-icon ${accent}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}

