export type QuizMode = "typing" | "multiple-choice" | "reverse" | "random" | "weak" | "timed" | "endless";

export interface CharacterStat {
  id: string;
  correct: number;
  wrong: number;
  lastSeen: number | null;
  /** Simple weight used for weak-character weighting; higher = needs more practice. */
  weight: number;
  mastered: boolean;
  favorite: boolean;
}

export interface StudySession {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  timestamp: number;
  mode: QuizMode;
  script: "hiragana" | "katakana" | "mixed";
  correct: number;
  wrong: number;
  durationSec: number;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  goal: number;
  unlockedAt: number | null;
}

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "indigo" | "vermillion" | "matcha" | "sakura" | "sumi";

export interface Settings {
  theme: ThemeMode;
  accent: AccentColor;
  fontSize: "sm" | "md" | "lg";
  animations: boolean;
  soundEffects: boolean;
  dailyGoalMinutes: number;
}

export interface ProgressState {
  version: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalStudySeconds: number;
  characterStats: Record<string, CharacterStat>;
  sessions: StudySession[];
  achievements: Achievement[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  accent: "indigo",
  fontSize: "md",
  animations: true,
  soundEffects: true,
  dailyGoalMinutes: 15,
};
