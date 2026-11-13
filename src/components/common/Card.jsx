import React from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  kicker,
  action,
  padding = true,
  onClick,
  ...props
}) {
  return (
    <div
      className={`custom-card ${padding ? "custom-card-pad" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || kicker || action) && (
        <div className="custom-card-header">
          <div>
            {kicker && <div className="section-kicker">{kicker}</div>}
            {title && <h3>{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="custom-card-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

