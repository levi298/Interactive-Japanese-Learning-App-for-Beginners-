import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { KanaCharacter } from "../../types/kana";
import type { CharacterStat } from "../../types/progress";

export function CharacterTile({ char, stat, onClick }: { char: KanaCharacter; stat: CharacterStat | undefined; onClick: () => void }) {
  const mastered = stat?.mastered;
  const struggling = (stat?.wrong ?? 0) > 0 && !mastered && (stat?.weight ?? 5) > 8;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        aspectRatio: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        borderRadius: "var(--radius-md)",
        border: `1px solid ${mastered ? "var(--accent)" : "var(--border)"}`,
        background: mastered ? "var(--accent-soft)" : "var(--bg-elevated)",
        cursor: "pointer",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {stat?.favorite && <Star size={11} fill="var(--vermillion)" color="var(--vermillion)" style={{ position: "absolute", top: 6, right: 6 }} />}
      {struggling && <span style={{ position: "absolute", top: 7, left: 7, width: 6, height: 6, borderRadius: "50%", background: "var(--vermillion)" }} />}
      <span style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--text)" }}>{char.char}</span>
      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{char.romaji}</span>
    </motion.button>
  );
}
