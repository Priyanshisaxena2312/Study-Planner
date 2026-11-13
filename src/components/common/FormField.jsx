import React from "react";

export function FormField({
  label,
  description,
  error,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="field-label">
          <span>{label}</span>
          {required && <span className="field-required">*</span>}
        </label>
      )}
      {children}
      {description && <div className="field-desc">{description}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

