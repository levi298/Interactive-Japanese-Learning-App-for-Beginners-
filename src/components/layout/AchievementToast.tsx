import { AnimatePresence, motion } from "framer-motion";
import { Award, Flame, Star, Target, GraduationCap, Repeat, Footprints } from "lucide-react";
import type { Achievement } from "../../types/progress";
import { useEffect, useMemo } from "react";

const ICONS: Record<string, React.ReactNode> = {
  award: <Award size={20} />,
  flame: <Flame size={20} />,
  star: <Star size={20} />,
  target: <Target size={20} />,
  "graduation-cap": <GraduationCap size={20} />,
  repeat: <Repeat size={20} />,
  footprints: <Footprints size={20} />,
};

export function AchievementToast({ achievement, onDismiss }: { achievement: Achievement | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  const petals = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 80,
        rotate: Math.random() * 360,
      })),
    [achievement?.id]
  );

  return (
    <AnimatePresence>
      {achievement && (
        <>
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 300 }}>
            {petals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ top: "-5%", left: `${p.left}%`, opacity: 0, rotate: 0 }}
                animate={{ top: "105%", left: `calc(${p.left}% + ${p.drift}px)`, opacity: [0, 1, 1, 0], rotate: p.rotate }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
                style={{ position: "absolute", fontSize: 18 }}
              >
                🌸
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: 28,
              right: 28,
              zIndex: 301,
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              maxWidth: 320,
              cursor: "pointer",
            }}
            onClick={onDismiss}
          >
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", background: "var(--accent-soft)", color: "var(--accent-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {ICONS[achievement.icon] ?? <Award size={20} />}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Achievement unlocked</div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{achievement.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{achievement.description}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
