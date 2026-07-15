import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 13, gap: 6 },
  md: { padding: "9px 16px", fontSize: 14, gap: 8 },
  lg: { padding: "12px 22px", fontSize: 15.5, gap: 10 },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", icon, fullWidth, style, children, ...rest }, ref) => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid transparent",
      borderRadius: "var(--radius-md)",
      fontWeight: 600,
      cursor: "pointer",
      transition: "transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
      width: fullWidth ? "100%" : undefined,
      ...sizeStyles[size],
    };

    const variants: Record<Variant, React.CSSProperties> = {
      primary: { background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-sm)" },
      secondary: { background: "var(--bg-elevated)", color: "var(--text)", borderColor: "var(--border)" },
      ghost: { background: "transparent", color: "var(--text-secondary)" },
      danger: { background: "transparent", color: "var(--vermillion)", borderColor: "rgba(196,69,61,0.35)" },
    };

    return (
      <button
        ref={ref}
        {...rest}
        style={{ ...base, ...variants[variant], ...style }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
          rest.onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          rest.onMouseUp?.(e);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          rest.onMouseLeave?.(e);
        }}
      >
        {icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
