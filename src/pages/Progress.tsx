import { useMemo } from "react";
import { AlertTriangle, Award, Flame, Repeat } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useAllKanaData } from "../hooks/useKanaData";
import { useNavigation } from "../context/NavigationContext";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { PageShell } from "./KanaScriptPage";

export function ProgressPage() {
  const { state } = useProgress();
  const { hiragana, katakana, all } = useAllKanaData();
  const { launchPractice } = useNavigation();

  const totalCorrect = Object.values(state.characterStats).reduce((s, c) => s + c.correct, 0);
  const totalWrong = Object.values(state.characterStats).reduce((s, c) => s + c.wrong, 0);
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  const hiraMastered = hiragana.filter((c) => state.characterStats[c.id]?.mastered).length;
  const kataMastered = katakana.filter((c) => state.characterStats[c.id]?.mastered).length;

  const now = Date.now();
  const day = 86400000;
  const dailySec = state.sessions.filter((s) => now - s.timestamp < day).reduce((sum, s) => sum + s.durationSec, 0);
  const weeklySec = state.sessions.filter((s) => now - s.timestamp < 7 * day).reduce((sum, s) => sum + s.durationSec, 0);
  const monthlySec = state.sessions.filter((s) => now - s.timestamp < 30 * day).reduce((sum, s) => sum + s.durationSec, 0);

  const struggling = useMemo(() => {
    return all
      .filter((c) => (state.characterStats[c.id]?.wrong ?? 0) > 0 && !state.characterStats[c.id]?.mastered)
      .sort((a, b) => (state.characterStats[b.id]?.weight ?? 0) - (state.characterStats[a.id]?.weight ?? 0))
      .slice(0, 12);
  }, [all, state.characterStats]);

  return (
    <PageShell title="Progress" subtitle="A closer look at your mastery, streaks, and study time.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <MiniStat icon={<Flame size={16} />} label="Current / longest streak" value={`${state.currentStreak}d / ${state.longestStreak}d`} />
        <MiniStat icon={<Award size={16} />} label="Overall accuracy" value={`${accuracy}%`} />
        <MiniStat icon={<Repeat size={16} />} label="Sessions completed" value={String(state.sessions.length)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Mastery by script</div>
          <MasteryRow label="Hiragana" mastered={hiraMastered} total={hiragana.length} />
          <div style={{ height: 14 }} />
          <MasteryRow label="Katakana" mastered={kataMastered} total={katakana.length} />
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Study time</div>
          <TimeRow label="Today" seconds={dailySec} />
          <TimeRow label="This week" seconds={weeklySec} />
          <TimeRow label="This month" seconds={monthlySec} />
          <TimeRow label="All time" seconds={state.totalStudySeconds} />
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <AlertTriangle size={16} color="var(--vermillion)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Characters you're struggling with</span>
        </div>
        {struggling.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>None right now — keep practicing to surface any tricky characters here.</p>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {struggling.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-md)", background: "var(--bg-inset)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{c.char}</span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{c.romaji}</span>
                </div>
              ))}
            </div>
            <Button size="sm" onClick={() => launchPractice({ script: "mixed", rows: "all", source: "weak", mode: "weak" })}>
              Practice these now
            </Button>
          </>
        )}
      </Card>
    </PageShell>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--accent)", marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
    </Card>
  );
}

function MasteryRow({ label, mastered, total }: { label: string; mastered: number; total: number }) {
  const pct = total ? (mastered / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ color: "var(--text-tertiary)" }}>
          {mastered}/{total}
        </span>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}

function TimeRow({ label, seconds }: { label: string; seconds: number }) {
  const mins = Math.round(seconds / 60);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{mins}m</span>
    </div>
  );
}
