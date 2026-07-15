import React from "react";

export function Badge({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "neutral" | "success" | "warning" }) {
  const tones: Record<string, React.CSSProperties> = {
    accent: { background: "var(--accent-soft)", color: "var(--accent-strong)" },
    neutral: { background: "var(--bg-inset)", color: "var(--text-secondary)" },
    success: { background: "rgba(90,125,90,0.16)", color: "#5a7d5a" },
    warning: { background: "rgba(196,69,61,0.14)", color: "var(--vermillion)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: "var(--radius-full)",
        fontSize: 12,
        fontWeight: 600,
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}
