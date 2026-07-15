import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, X, Volume2 } from "lucide-react";
import type { KanaCharacter } from "../../types/kana";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../ui/Button";

interface LearnModePanelProps {
  characters: KanaCharacter[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}

export function LearnModePanel({ characters, index, onIndexChange, onClose }: LearnModePanelProps) {
  const { state, toggleFavorite } = useProgress();
  const char = characters[index];
  const stat = char ? state.characterStats[char.id] : undefined;

  const next = useCallback(() => onIndexChange((index + 1) % characters.length), [index, characters.length, onIndexChange]);
  const prev = useCallback(() => onIndexChange((index - 1 + characters.length) % characters.length), [index, characters.length, onIndexChange]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose]);

  const speak = () => {
    if (!char) return;
    try {
      const utter = new SpeechSynthesisUtterance(char.romaji);
      utter.lang = "ja-JP";
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    } catch {
      /* speechSynthesis unavailable — silently ignore */
    }
  };

  if (!char) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 460,
          maxWidth: "90vw",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          padding: 28,
          textAlign: "center",
          position: "relative",
        }}
      >
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
          <X size={18} />
        </button>

        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "capitalize" }}>
          {char.script} · {index + 1} / {characters.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={char.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 96, lineHeight: 1.1, margin: "8px 0" }}>{char.char}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-strong)", marginBottom: 14 }}>{char.romaji}</div>
            <div style={{ background: "var(--bg-inset)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ fontSize: 17, marginBottom: 2 }}>{char.example.word}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                {char.example.romaji} · {char.example.meaning}
              </div>
            </div>
            {char.notes && <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 8 }}>{char.notes}</div>}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20 }}>
          <Button variant="secondary" size="sm" onClick={prev} icon={<ChevronLeft size={15} />}>
            Prev
          </Button>
          <Button variant="secondary" size="sm" onClick={speak} icon={<Volume2 size={15} />}>
            Pronounce
          </Button>
          <Button
            variant={stat?.favorite ? "primary" : "secondary"}
            size="sm"
            onClick={() => toggleFavorite(char.id)}
            icon={<Star size={15} fill={stat?.favorite ? "#fff" : "none"} />}
          >
            {stat?.favorite ? "Favorited" : "Favorite"}
          </Button>
          <Button variant="secondary" size="sm" onClick={next} icon={<ChevronRight size={15} />}>
            Next
          </Button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 14 }}>Use ← → to navigate · Esc to close</div>
      </motion.div>
    </motion.div>
  );
}
