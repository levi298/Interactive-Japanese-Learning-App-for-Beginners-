import { useEffect, useState } from "react";
import { useNavigation } from "../context/NavigationContext";
import type { PracticeConfig } from "../context/NavigationContext";
import { PracticeSetup } from "../components/practice/PracticeSetup";
import { PracticeSession } from "../components/practice/PracticeSession";
import { PageShell } from "./KanaScriptPage";

export function PracticePage() {
  const { practiceConfig, autoStartPractice, consumeAutoStart } = useNavigation();
  const [active, setActive] = useState<{ config: PracticeConfig; timerSec: number | null } | null>(null);

  useEffect(() => {
    if (autoStartPractice) {
      setActive({ config: practiceConfig, timerSec: null });
      consumeAutoStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartPractice]);

  return (
    <PageShell title="Practice" subtitle={active ? "Stay focused — you've got this." : "Choose how you'd like to practice."}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {active ? (
          <PracticeSession config={active.config} timerSec={active.timerSec} onExit={() => setActive(null)} />
        ) : (
          <PracticeSetup initial={practiceConfig} onStart={(config, timerSec) => setActive({ config, timerSec })} />
        )}
      </div>
    </PageShell>
  );
}
