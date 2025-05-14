import React from "react";
import "./Button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "solid",
  className = "",
}) {
  const base = "btn";
  const style = variant === "outline" ? "btn-outline" : "btn-solid";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${style} ${className}`}
    >
      {children}
    </button>
  );
}
