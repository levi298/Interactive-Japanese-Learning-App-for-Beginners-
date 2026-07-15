import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  padding?: number | string;
  interactive?: boolean;
}

export function Card({ padding = 20, interactive = false, style, children, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, boxShadow: "var(--shadow-md)" } : undefined}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding,
        boxShadow: "var(--shadow-sm)",
        cursor: interactive ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
