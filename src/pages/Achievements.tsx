import { Award, Flame, Star, Target, GraduationCap, Repeat, Footprints, Lock } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { PageShell } from "./KanaScriptPage";

const ICONS: Record<string, React.ReactNode> = {
  award: <Award size={20} />,
  flame: <Flame size={20} />,
  star: <Star size={20} />,
  target: <Target size={20} />,
  "graduation-cap": <GraduationCap size={20} />,
  repeat: <Repeat size={20} />,
  footprints: <Footprints size={20} />,
};

export function AchievementsPage() {
  const { state } = useProgress();
  const unlockedCount = state.achievements.filter((a) => a.unlockedAt).length;

  return (
    <PageShell title="Achievements" subtitle={`${unlockedCount} of ${state.achievements.length} unlocked`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {state.achievements.map((a) => {
          const unlocked = !!a.unlockedAt;
          return (
            <Card key={a.id} style={{ opacity: unlocked ? 1 : 0.75 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: unlocked ? "var(--accent-soft)" : "var(--bg-inset)",
                  color: unlocked ? "var(--accent-strong)" : "var(--text-tertiary)",
                  marginBottom: 12,
                }}
              >
                {unlocked ? ICONS[a.icon] ?? <Award size={20} /> : <Lock size={17} />}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: "4px 0 10px" }}>{a.description}</div>
              {!unlocked && <ProgressBar value={0} height={5} />}
              {unlocked && <div style={{ fontSize: 11, color: "var(--accent-strong)", fontWeight: 600 }}>Unlocked {new Date(a.unlockedAt!).toLocaleDateString()}</div>}
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
