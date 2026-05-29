import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary" | "accent" | "none";
}

export default function GlassPanel({ children, className = "", glowColor = "none" }: GlassPanelProps) {
  const glowClass = glowColor !== "none" ? `glow-${glowColor}` : "";
  return (
    <div className={`glass rounded-xl p-6 ${glowClass} ${className}`}>
      {children}
    </div>
  );
}
