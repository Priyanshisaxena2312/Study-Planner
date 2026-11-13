import React from "react";

export function PageHeader({
  eyebrow = "WORKSPACE",
  title,
  subtitle,
  actions,
}) {
  return (
    <section className="welcome-row">
      <div>
        {eyebrow && (
          <div className="eyebrow">
            <span className="eyebrow-dot" /> {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </section>
  );
}

