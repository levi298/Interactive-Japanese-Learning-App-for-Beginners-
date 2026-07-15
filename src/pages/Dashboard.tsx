import { Flame, Target, Clock, Zap, Languages, Shuffle, TrendingUp } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useNavigation } from "../context/NavigationContext";
import { useAllKanaData } from "../hooks/useKanaData";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { levelFromTotalXp } from "../store/xp";
import { PageShell } from "./KanaScriptPage";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { state } = useProgress();
  const { launchPractice, setPage } = useNavigation();
  const { hiragana, katakana } = useAllKanaData();

  const { xpIntoLevel, xpForNext } = levelFromTotalXp(state.xp);
  const totalChars = hiragana.length + katakana.length;
  const masteredChars = Object.values(state.characterStats).filter((s) => s.mastered).length;
  const totalCorrect = Object.values(state.characterStats).reduce((s, c) => s + c.correct, 0);
  const totalWrong = Object.values(state.characterStats).reduce((s, c) => s + c.wrong, 0);
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const todaysSessions = state.sessions.filter((s) => s.date === today);
  const todaysMinutes = Math.round(todaysSessions.reduce((s, x) => s + x.durationSec, 0) / 60);
  const goalPct = Math.min(100, (todaysMinutes / Math.max(1, state.settings.dailyGoalMinutes)) * 100);

  const recent = [...state.sessions].reverse().slice(0, 4);

  return (
    <PageShell title={`${greeting()}.`} subtitle="Here's where your Japanese studies stand today.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard icon={<Flame size={17} />} label="Current streak" value={`${state.currentStreak}d`} sub={`Best: ${state.longestStreak}d`} />
        <StatCard icon={<Zap size={17} />} label="Level" value={String(state.level)} sub={`${xpIntoLevel}/${xpForNext} XP`} />
        <StatCard icon={<TrendingUp size={17} />} label="Accuracy" value={`${accuracy}%`} sub={`${totalCorrect} correct`} />
        <StatCard icon={<Languages size={17} />} label="Characters mastered" value={`${masteredChars}/${totalChars}`} sub="Hiragana + Katakana" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Today's goal</span>
            </div>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
              {todaysMinutes} / {state.settings.dailyGoalMinutes} min
            </span>
          </div>
          <ProgressBar value={goalPct} />
          <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 10 }}>
            {goalPct >= 100 ? "Goal reached — great work today! 🎉" : "A few more minutes of practice will hit your daily goal."}
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Clock size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Recent practice</span>
          </div>
          {recent.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>No sessions yet — start practicing to see history here.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.mode.replace("-", " ")}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>
                    {s.correct}/{s.correct + s.wrong} correct
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Quick start</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button icon={<Languages size={15} />} onClick={() => setPage("hiragana")}>
            Study Hiragana
          </Button>
          <Button icon={<Languages size={15} />} onClick={() => setPage("katakana")}>
            Study Katakana
          </Button>
          <Button variant="secondary" icon={<Shuffle size={15} />} onClick={() => launchPractice({ script: "mixed", rows: "all", source: "random", mode: "random" })}>
            Random practice
          </Button>
          <Button variant="secondary" icon={<Zap size={15} />} onClick={() => launchPractice({ script: "mixed", rows: "all", source: "weak", mode: "weak" })}>
            Review weak characters
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--accent)", marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>{sub}</div>
    </Card>
  );
}
