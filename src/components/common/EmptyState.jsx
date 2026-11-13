import React from "react";
import { Sparkles } from "lucide-react";

export function EmptyState({
  icon: Icon = Sparkles,
  title = "Nothing here yet",
  description = "Get started by adding your first item.",
  action,
  className = "",
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon-wrap">
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

