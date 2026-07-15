import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { KanaCharacter } from "../../types/kana";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  characters: KanaCharacter[];
  onSelect: (char: KanaCharacter) => void;
}

export function CommandPalette({ open, onClose, characters, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return characters.slice(0, 8);
    const q = query.trim().toLowerCase();
    return characters
      .filter((c) => c.char.includes(q) || c.romaji.includes(q) || c.example.meaning.toLowerCase().includes(q) || c.example.word.includes(q))
      .slice(0, 20);
  }, [query, characters]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 200, display: "flex", justifyContent: "center", paddingTop: "12vh" }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 520, maxHeight: "60vh", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <Search size={16} color="var(--text-tertiary)" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by kana, romaji, or meaning..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: "var(--text)" }}
              />
              <kbd style={{ fontSize: 11, background: "var(--bg-inset)", padding: "2px 6px", borderRadius: 4, color: "var(--text-tertiary)" }}>Esc</kbd>
            </div>
            <div style={{ overflowY: "auto", padding: 8 }}>
              {results.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13.5 }}>No characters found.</div>}
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "9px 12px", border: "none", background: "transparent", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-inset)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, width: 34 }}>{c.char}</span>
                  <span style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.romaji}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {c.example.word} · {c.example.meaning}
                    </div>
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "capitalize" }}>{c.script}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
