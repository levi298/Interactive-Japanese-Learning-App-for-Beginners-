import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({ value, color = "var(--accent)", height = 8, trackColor = "var(--bg-inset)" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div style={{ width: "100%", height, borderRadius: "var(--radius-full)", background: trackColor, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: "100%", background: color, borderRadius: "var(--radius-full)" }}
      />
    </div>
  );
}
