import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X as XIcon, Flag } from "lucide-react";
import type { KanaCharacter } from "../../types/kana";
import type { QuizMode } from "../../types/progress";
import type { PracticeConfig } from "../../context/NavigationContext";
import { useAllKanaData } from "../../hooks/useKanaData";
import { useProgress } from "../../context/ProgressContext";
import { pickWeighted, shuffle } from "../../utils/weighting";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

type EffectiveQuestionType = "multiple-choice" | "typing" | "reverse";

interface Question {
  char: KanaCharacter;
  type: EffectiveQuestionType;
  options?: KanaCharacter[]; // for multiple-choice / reverse
}

function questionTypeFor(mode: QuizMode): EffectiveQuestionType {
  if (mode === "typing") return "typing";
  if (mode === "reverse") return "reverse";
  return "multiple-choice";
}

export function PracticeSession({ config, timerSec, onExit }: { config: PracticeConfig; timerSec: number | null; onExit: () => void }) {
  const { hiragana, katakana, loading } = useAllKanaData();
  const { state, recordAnswer, logSession } = useProgress();

  const pool = useMemo(() => {
    let base: KanaCharacter[] = config.script === "mixed" ? [...hiragana, ...katakana] : config.script === "hiragana" ? hiragana : katakana;
    if (config.source === "weak") {
      base = base.filter((c) => (state.characterStats[c.id]?.weight ?? 5) > 8 && !state.characterStats[c.id]?.mastered);
    } else if (config.source === "favorites") {
      base = base.filter((c) => state.characterStats[c.id]?.favorite);
    }
    return base;
  }, [config, hiragana, katakana, state.characterStats]);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<"correct" | "wrong" | null>(null);
  const [typedValue, setTypedValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(timerSec ?? 0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const buildQuestion = useMemo(
    () => (): Question | null => {
      if (pool.length === 0) return null;
      const char = config.mode === "weak" || config.source === "weak" ? pickWeighted(pool, state.characterStats) : shuffle(pool)[0];
      const type = config.mode === "random" ? shuffle<EffectiveQuestionType>(["multiple-choice", "typing", "reverse"])[0] : questionTypeFor(config.mode);
      let options: KanaCharacter[] | undefined;
      if (type === "multiple-choice" || type === "reverse") {
        const distractors = shuffle(pool.filter((c) => c.id !== char.id)).slice(0, 3);
        options = shuffle([char, ...distractors]);
      }
      return { char, type, options };
    },
    [pool, config, state.characterStats]
  );

  useEffect(() => {
    setQuestion(buildQuestion());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length]);

  useEffect(() => {
    if (question?.type === "typing" && !answered) inputRef.current?.focus();
  }, [question, answered]);

  // Timer countdown for "timed" mode
  useEffect(() => {
    if (timerSec === null || finished) return;
    if (timeLeft <= 0) {
      finishSession();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerSec, finished]);

  function finishSession() {
    if (finished) return;
    setFinished(true);
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const xpEarned = correct * 4;
    logSession({
      mode: config.mode,
      script: config.script === "mixed" ? "mixed" : config.script,
      correct,
      wrong,
      durationSec,
      xpEarned,
    });
  }

  function handleAnswer(isCorrect: boolean) {
    if (!question || answered) return;
    setAnswered(isCorrect ? "correct" : "wrong");
    recordAnswer(question.char.id, isCorrect, config.mode);
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setTimeout(() => {
      setAnswered(null);
      setTypedValue("");
      setQuestion(buildQuestion());
    }, 650);
  }

  function checkTyped() {
    if (!question) return;
    const normalized = typedValue.trim().toLowerCase();
    handleAnswer(normalized === question.char.romaji.toLowerCase());
  }

  if (loading) return <div style={{ padding: 40, color: "var(--text-tertiary)" }}>Loading characters...</div>;

  if (pool.length === 0) {
    return (
      <Card style={{ maxWidth: 480, textAlign: "center", padding: 32 }}>
        <p style={{ marginBottom: 16, color: "var(--text-secondary)" }}>
          No characters match this practice setup yet {config.source === "favorites" ? "— try favoriting a few characters first." : config.source === "weak" ? "— nice work, no weak characters right now!" : "."}
        </p>
        <Button onClick={onExit}>Back to setup</Button>
      </Card>
    );
  }

  if (finished) {
    const total = correct + wrong;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    return (
      <Card style={{ maxWidth: 420, textAlign: "center", padding: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Session complete</h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: 13.5, marginBottom: 20 }}>Nice work — here's how it went.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Correct" value={String(correct)} />
          <Stat label="Wrong" value={String(wrong)} />
        </div>
        <Button fullWidth onClick={onExit}>
          Done
        </Button>
      </Card>
    );
  }

  if (!question) return null;

  const total = correct + wrong;

  return (
    <div style={{ maxWidth: 560, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          <span>
            <Check size={13} style={{ verticalAlign: -2 }} color="var(--matcha)" /> {correct}
          </span>
          <span>
            <XIcon size={13} style={{ verticalAlign: -2 }} color="var(--vermillion)" /> {wrong}
          </span>
          {total > 0 && <span>{Math.round((correct / total) * 100)}% accuracy</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {timerSec !== null && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: timeLeft <= 10 ? "var(--vermillion)" : "var(--text-secondary)" }}>
              0:{String(timeLeft).padStart(2, "0")}
            </span>
          )}
          <button onClick={finishSession} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 12.5, cursor: "pointer" }}>
            <Flag size={13} /> End session
          </button>
        </div>
      </div>

      <Card padding={32} style={{ textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.div key={question.char.id + question.type} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {question.type === "reverse" ? (
              <>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 6 }}>Which kana matches:</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 700, marginBottom: 26 }}>{question.char.romaji}</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-display)", fontSize: 90, marginBottom: 26 }}>{question.char.char}</div>
            )}

            {question.type === "typing" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <input
                  ref={inputRef}
                  value={typedValue}
                  onChange={(e) => setTypedValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkTyped()}
                  disabled={!!answered}
                  placeholder="Type the romaji..."
                  style={{
                    width: 220,
                    textAlign: "center",
                    fontSize: 18,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${answered === "correct" ? "var(--matcha)" : answered === "wrong" ? "var(--vermillion)" : "var(--border)"}`,
                    background: "var(--bg-inset)",
                    color: "var(--text)",
                  }}
                />
                <Button onClick={checkTyped} disabled={!!answered}>
                  Check
                </Button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {question.options!.map((opt) => {
                  const isCorrectOpt = opt.id === question.char.id;
                  const showState = answered && isCorrectOpt ? "correct" : answered && !isCorrectOpt ? "neutral" : null;
                  return (
                    <button
                      key={opt.id}
                      disabled={!!answered}
                      onClick={() => handleAnswer(isCorrectOpt)}
                      style={{
                        padding: "14px 10px",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${showState === "correct" ? "var(--matcha)" : "var(--border)"}`,
                        background: showState === "correct" ? "rgba(90,125,90,0.14)" : "var(--bg-inset)",
                        fontSize: question.type === "reverse" ? 28 : 16,
                        fontFamily: question.type === "reverse" ? "var(--font-display)" : "inherit",
                        fontWeight: 600,
                        cursor: answered ? "default" : "pointer",
                        color: "var(--text)",
                      }}
                    >
                      {question.type === "reverse" ? opt.char : opt.romaji}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {config.mode !== "timed" && config.mode !== "endless" && <ProgressBar value={Math.min(100, total * 4)} height={4} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{label}</div>
    </div>
  );
}
