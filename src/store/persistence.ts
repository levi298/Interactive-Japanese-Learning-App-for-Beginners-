import { STORAGE_PREFIX } from "../config/app.config";
import type { ProgressState } from "../types/progress";
import { DEFAULT_SETTINGS } from "../types/progress";
import { ACHIEVEMENT_DEFS } from "./achievements";

const PROGRESS_KEY = `${STORAGE_PREFIX}:progress`;
const SCHEMA_VERSION = 1;

export function createDefaultProgress(): ProgressState {
  return {
    version: SCHEMA_VERSION,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudySeconds: 0,
    characterStats: {},
    sessions: [],
    achievements: ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlockedAt: null })),
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Never throws — a corrupted/missing save silently falls back to defaults so progress is never "lost" in a crash loop. */
export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    // Merge with defaults to survive schema additions across versions.
    const defaults = createDefaultProgress();
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      achievements: mergeAchievements(defaults.achievements, parsed.achievements),
    };
  } catch (err) {
    console.error("Failed to load progress, starting fresh.", err);
    return createDefaultProgress();
  }
}

function mergeAchievements(defaults: ProgressState["achievements"], saved: ProgressState["achievements"] | undefined) {
  if (!saved) return defaults;
  const byId = new Map(saved.map((a) => [a.id, a]));
  return defaults.map((def) => byId.get(def.id) ?? def);
}

export function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save progress", err);
  }
}

export function exportProgressJson(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function parseImportedProgress(json: string): ProgressState {
  const parsed = JSON.parse(json) as ProgressState;
  const defaults = createDefaultProgress();
  return {
    ...defaults,
    ...parsed,
    settings: { ...defaults.settings, ...parsed.settings },
    achievements: mergeAchievements(defaults.achievements, parsed.achievements),
  };
}

export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
