import type { KanaCharacter } from "../types/kana";
import type { CharacterStat } from "../types/progress";

export const MASTERY_CORRECT_STREAK = 5;

/** Updates a character's stat after an answer. Mastery requires several consecutive-ish correct answers and few wrongs. */
export function updateStatAfterAnswer(stat: CharacterStat, correct: boolean): CharacterStat {
  const next: CharacterStat = { ...stat, lastSeen: Date.now() };
  if (correct) {
    next.correct += 1;
    next.weight = Math.max(1, next.weight - 2);
    const ratio = next.correct / Math.max(1, next.correct + next.wrong);
    if (next.correct >= MASTERY_CORRECT_STREAK && ratio >= 0.75) next.mastered = true;
  } else {
    next.wrong += 1;
    next.weight = Math.min(20, next.weight + 4);
    next.mastered = false;
  }
  return next;
}

export function defaultStat(id: string): CharacterStat {
  return { id, correct: 0, wrong: 0, lastSeen: null, weight: 5, mastered: false, favorite: false };
}

/** Weighted random pick — characters missed more often (higher weight) appear more frequently. */
export function pickWeighted(chars: KanaCharacter[], stats: Record<string, CharacterStat>): KanaCharacter {
  const weights = chars.map((c) => stats[c.id]?.weight ?? 5);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < chars.length; i++) {
    r -= weights[i];
    if (r <= 0) return chars[i];
  }
  return chars[chars.length - 1];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
