import { useEffect, useMemo, useState } from "react";
import { Shuffle, Star, Zap, AlertTriangle } from "lucide-react";
import type { RowId, ScriptId } from "../types/kana";
import { ROW_LABELS } from "../types/kana";
import { useKanaData } from "../hooks/useKanaData";
import { useProgress } from "../context/ProgressContext";
import { useNavigation } from "../context/NavigationContext";
import { CharacterTile } from "../components/kana/CharacterTile";
import { LearnModePanel } from "../components/kana/LearnModePanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

type FilterMode = "all" | RowId | "weak" | "favorites";

export function KanaScriptPage({ script, title }: { script: ScriptId; title: string }) {
  const { characters, loading } = useKanaData(script);
  const { state } = useProgress();
  const { launchPractice, jumpTarget, clearJumpTarget } = useNavigation();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [learnIndex, setLearnIndex] = useState<number | null>(null);

  useEffect(() => {
    if (jumpTarget && jumpTarget.script === script) {
      const idx = characters.findIndex((c) => c.id === jumpTarget.id);
      if (idx >= 0) {
        setLearnIndex(idx);
        clearJumpTarget();
      }
    }
  }, [jumpTarget, characters, script, clearJumpTarget]);

  const rowsPresent = useMemo(() => Array.from(new Set(characters.map((c) => c.row))) as RowId[], [characters]);

  const filtered = useMemo(() => {
    if (filter === "all") return characters;
    if (filter === "weak") return characters.filter((c) => (state.characterStats[c.id]?.weight ?? 5) > 8 && !state.characterStats[c.id]?.mastered);
    if (filter === "favorites") return characters.filter((c) => state.characterStats[c.id]?.favorite);
    return characters.filter((c) => c.row === filter);
  }, [characters, filter, state.characterStats]);

  const masteredCount = characters.filter((c) => state.characterStats[c.id]?.mastered).length;
  const masteredPct = characters.length ? (masteredCount / characters.length) * 100 : 0;

  if (loading) return <PageShell title={title}><div style={{ color: "var(--text-tertiary)" }}>Loading characters...</div></PageShell>;

  return (
    <PageShell title={title} subtitle={`${characters.length} characters · ${masteredCount} mastered`}>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Mastery progress</span>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{Math.round(masteredPct)}%</span>
        </div>
        <ProgressBar value={masteredPct} />
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Button icon={<Zap size={15} />} onClick={() => launchPractice({ script, rows: "all", source: "all", mode: "multiple-choice" })}>
            Study entire alphabet
          </Button>
          <Button variant="secondary" icon={<AlertTriangle size={15} />} onClick={() => launchPractice({ script, rows: "all", source: "weak", mode: "weak" })}>
            Practice weak characters
          </Button>
          <Button variant="secondary" icon={<Star size={15} />} onClick={() => launchPractice({ script, rows: "all", source: "favorites", mode: "random" })}>
            Practice favorites
          </Button>
          <Button variant="secondary" icon={<Shuffle size={15} />} onClick={() => launchPractice({ script, rows: "all", source: "random", mode: "random" })}>
            Random practice
          </Button>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All rows" />
        <FilterChip active={filter === "weak"} onClick={() => setFilter("weak")} label="Weak characters" />
        <FilterChip active={filter === "favorites"} onClick={() => setFilter("favorites")} label="Favorites" />
        {rowsPresent.map((row) => (
          <FilterChip key={row} active={filter === row} onClick={() => setFilter(row)} label={ROW_LABELS[row]} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: "var(--text-tertiary)", fontSize: 13.5, padding: "24px 0" }}>No characters match this filter yet.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 10 }}>
          {filtered.map((c) => (
            <CharacterTile key={c.id} char={c} stat={state.characterStats[c.id]} onClick={() => setLearnIndex(filtered.indexOf(c))} />
          ))}
        </div>
      )}

      {learnIndex !== null && (
        <LearnModePanel characters={filtered} index={learnIndex} onIndexChange={setLearnIndex} onClose={() => setLearnIndex(null)} />
      )}
    </PageShell>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 13px",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
        color: active ? "var(--accent-strong)" : "var(--text-secondary)",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "28px 32px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-tertiary)", fontSize: 13.5, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
