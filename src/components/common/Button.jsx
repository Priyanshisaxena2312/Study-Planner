import React from "react";

export function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost" | "text" | "outline"
  size = "md", // "sm" | "md" | "lg"
  icon: Icon,
  iconPosition = "left",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  ...props
}) {
  const baseClasses = `app-btn btn-${variant} btn-${size} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
          <span>{children}</span>
          {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
        </>
      )}
    </button>
  );
}

