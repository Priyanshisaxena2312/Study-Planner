import React from "react";

export function ProgressBar({
  value = 0,
  max = 100,
  tone = "sage", // "sage" | "olive" | "sand" | "peach" | "lavender"
  showLabel = false,
  height = 6,
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-label-row">
          <span>Progress</span>
          <strong>{percentage}%</strong>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className={`progress-fill ${tone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

