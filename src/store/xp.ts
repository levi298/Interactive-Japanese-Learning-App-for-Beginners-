/** XP required to go from level N to N+1 grows gently so early levels feel quick. */
export function xpForLevel(level: number): number {
  return Math.round(50 * Math.pow(level, 1.35));
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpForLevel(level) };
}

export function xpForAnswer(opts: { correct: boolean; mode: string }): number {
  if (!opts.correct) return 0;
  const base = { typing: 6, "multiple-choice": 3, reverse: 4, random: 4, weak: 5, timed: 5, endless: 3 } as Record<string, number>;
  return base[opts.mode] ?? 3;
}
