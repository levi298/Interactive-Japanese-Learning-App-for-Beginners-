import { useState } from "react";
import { Keyboard, ListChecks, RotateCcw, Shuffle, AlertTriangle, Timer, Infinity as InfinityIcon, Play } from "lucide-react";
import type { PracticeConfig } from "../../context/NavigationContext";
import type { QuizMode } from "../../types/progress";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

const MODES: { id: QuizMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "multiple-choice", label: "Multiple Choice", desc: "Pick the right reading from 4 options.", icon: <ListChecks size={18} /> },
  { id: "typing", label: "Typing Quiz", desc: "Type the romaji for the character shown.", icon: <Keyboard size={18} /> },
  { id: "reverse", label: "Reverse Quiz", desc: "Given romaji, choose the matching kana.", icon: <RotateCcw size={18} /> },
  { id: "random", label: "Random Mode", desc: "A shuffled mix of question styles.", icon: <Shuffle size={18} /> },
  { id: "weak", label: "Weak Characters", desc: "Focus on characters you often miss.", icon: <AlertTriangle size={18} /> },
  { id: "timed", label: "Timed Mode", desc: "Answer as many as you can before time runs out.", icon: <Timer size={18} /> },
  { id: "endless", label: "Endless Mode", desc: "Practice with no end — stop whenever.", icon: <InfinityIcon size={18} /> },
];

const TIMER_PRESETS = [30, 60, 120];

export function PracticeSetup({
  initial,
  onStart,
}: {
  initial: PracticeConfig;
  onStart: (config: PracticeConfig, timerSec: number | null) => void;
}) {
  const [script, setScript] = useState<PracticeConfig["script"]>(initial.script);
  const [mode, setMode] = useState<QuizMode>(initial.mode);
  const [timerSec, setTimerSec] = useState<number>(60);
  const [customTimer, setCustomTimer] = useState("");

  const needsTimer = mode === "timed";

  return (
    <div style={{ maxWidth: 780 }}>
      <Card style={{ marginBottom: 20 }}>
        <SectionLabel>Script</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {(["hiragana", "katakana", "mixed"] as const).map((s) => (
            <Chip key={s} active={script === s} label={s === "mixed" ? "Both" : s} onClick={() => setScript(s)} />
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <SectionLabel>Quiz mode</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${mode === m.id ? "var(--accent)" : "var(--border)"}`,
                background: mode === m.id ? "var(--accent-soft)" : "var(--bg-elevated)",
                cursor: "pointer",
              }}
            >
              <span style={{ color: mode === m.id ? "var(--accent-strong)" : "var(--text-tertiary)", marginTop: 1 }}>{m.icon}</span>
              <span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: mode === m.id ? "var(--accent-strong)" : "var(--text)" }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{m.desc}</div>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {needsTimer && (
        <Card style={{ marginBottom: 20 }}>
          <SectionLabel>Timer duration</SectionLabel>
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            {TIMER_PRESETS.map((t) => (
              <Chip key={t} active={timerSec === t && !customTimer} label={`${t}s`} onClick={() => { setTimerSec(t); setCustomTimer(""); }} />
            ))}
            <input
              value={customTimer}
              onChange={(e) => {
                setCustomTimer(e.target.value.replace(/\D/g, ""));
                if (e.target.value) setTimerSec(Number(e.target.value));
              }}
              placeholder="Custom (sec)"
              style={{ width: 110, padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", fontSize: 13 }}
            />
          </div>
        </Card>
      )}

      <Button size="lg" icon={<Play size={16} fill="#fff" />} onClick={() => onStart({ script, rows: "all", source: mode === "weak" ? "weak" : "all", mode }, needsTimer ? timerSec : null)}>
        Start practice
      </Button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</div>;
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
        color: active ? "var(--accent-strong)" : "var(--text-secondary)",
        fontSize: 12.5,
        fontWeight: 600,
        textTransform: "capitalize",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
