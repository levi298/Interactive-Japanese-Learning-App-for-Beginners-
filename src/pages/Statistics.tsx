import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Trophy } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useAllKanaData } from "../hooks/useKanaData";
import { Card } from "../components/ui/Card";
import { PageShell } from "./KanaScriptPage";

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function StatisticsPage() {
  const { state } = useProgress();
  const { all } = useAllKanaData();

  const days = lastNDays(14);

  const accuracyByDay = useMemo(
    () =>
      days.map((date) => {
        const sessions = state.sessions.filter((s) => s.date === date);
        const correct = sessions.reduce((s, x) => s + x.correct, 0);
        const wrong = sessions.reduce((s, x) => s + x.wrong, 0);
        const total = correct + wrong;
        return { date: date.slice(5), accuracy: total ? Math.round((correct / total) * 100) : null };
      }),
    [days, state.sessions]
  );

  const studyTimeByDay = useMemo(
    () =>
      days.map((date) => {
        const sessions = state.sessions.filter((s) => s.date === date);
        return { date: date.slice(5), minutes: Math.round(sessions.reduce((s, x) => s + x.durationSec, 0) / 60) };
      }),
    [days, state.sessions]
  );

  const mastered = all.filter((c) => state.characterStats[c.id]?.mastered).length;
  const remaining = all.length - mastered;

  const bestDay = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const s of state.sessions) totals[s.date] = (totals[s.date] ?? 0) + s.correct;
    const entries = Object.entries(totals);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [state.sessions]);

  const pieData = [
    { name: "Mastered", value: mastered, color: "var(--accent)" },
    { name: "Remaining", value: remaining, color: "var(--bg-inset)" },
  ];

  const axisStyle = { fontSize: 11, fill: "var(--text-tertiary)" };

  return (
    <PageShell title="Statistics" subtitle="Trends across your last two weeks of practice.">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Accuracy over time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Characters mastered</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            {mastered} / {all.length} mastered
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Study time (minutes/day)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studyTimeByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Trophy size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Best day</span>
          </div>
          {bestDay ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{bestDay[1]} correct</div>
              <div style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{bestDay[0]}</div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Complete a session to see your best day.</p>
          )}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>Current streak</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{state.currentStreak} days</div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
