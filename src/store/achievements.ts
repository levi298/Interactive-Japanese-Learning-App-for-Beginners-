import type { Achievement, ProgressState } from "../types/progress";

export const ACHIEVEMENT_DEFS: Achievement[] = [
  { id: "first-steps", title: "First Steps", description: "Complete your first practice session.", icon: "footprints", goal: 1, unlockedAt: null },
  { id: "streak-3", title: "Getting Warmed Up", description: "Reach a 3-day study streak.", icon: "flame", goal: 3, unlockedAt: null },
  { id: "streak-7", title: "One Week Strong", description: "Reach a 7-day study streak.", icon: "flame", goal: 7, unlockedAt: null },
  { id: "streak-30", title: "Unstoppable", description: "Reach a 30-day study streak.", icon: "flame", goal: 30, unlockedAt: null },
  { id: "hiragana-master", title: "Hiragana Master", description: "Master all 104 Hiragana characters.", icon: "award", goal: 104, unlockedAt: null },
  { id: "katakana-master", title: "Katakana Master", description: "Master all 104 Katakana characters.", icon: "award", goal: 104, unlockedAt: null },
  { id: "correct-100", title: "Century Club", description: "Answer 100 questions correctly.", icon: "target", goal: 100, unlockedAt: null },
  { id: "correct-1000", title: "Kana Scholar", description: "Answer 1000 questions correctly.", icon: "graduation-cap", goal: 1000, unlockedAt: null },
  { id: "level-5", title: "Rising Star", description: "Reach level 5.", icon: "star", goal: 5, unlockedAt: null },
  { id: "level-10", title: "Dedicated Learner", description: "Reach level 10.", icon: "star", goal: 10, unlockedAt: null },
  { id: "sessions-25", title: "Creature of Habit", description: "Complete 25 practice sessions.", icon: "repeat", goal: 25, unlockedAt: null },
];

/** Returns achievements newly unlocked by the given state (does not mutate). */
export function checkNewlyUnlocked(state: ProgressState): Achievement[] {
  const totalCorrect = Object.values(state.characterStats).reduce((s, c) => s + c.correct, 0);
  const hiraMastered = Object.entries(state.characterStats).filter(([id, s]) => id.startsWith("hira-") && s.mastered).length;
  const kataMastered = Object.entries(state.characterStats).filter(([id, s]) => id.startsWith("kata-") && s.mastered).length;

  const progressFor: Record<string, number> = {
    "first-steps": state.sessions.length,
    "streak-3": state.currentStreak,
    "streak-7": state.currentStreak,
    "streak-30": state.currentStreak,
    "hiragana-master": hiraMastered,
    "katakana-master": kataMastered,
    "correct-100": totalCorrect,
    "correct-1000": totalCorrect,
    "level-5": state.level,
    "level-10": state.level,
    "sessions-25": state.sessions.length,
  };

  const newlyUnlocked: Achievement[] = [];
  for (const a of state.achievements) {
    if (a.unlockedAt) continue;
    const progress = progressFor[a.id] ?? 0;
    if (progress >= a.goal) newlyUnlocked.push({ ...a, unlockedAt: Date.now() });
  }
  return newlyUnlocked;
}
