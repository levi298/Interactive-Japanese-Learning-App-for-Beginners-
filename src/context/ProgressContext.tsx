import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Achievement, ProgressState, QuizMode, Settings, StudySession } from "../types/progress";
import { loadProgress, saveProgress, createDefaultProgress, exportProgressJson, parseImportedProgress, clearProgress } from "../store/persistence";
import { defaultStat, updateStatAfterAnswer } from "../utils/weighting";
import { checkNewlyUnlocked } from "../store/achievements";
import { levelFromTotalXp, xpForAnswer } from "../store/xp";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

interface ProgressContextValue {
  state: ProgressState;
  recordAnswer: (characterId: string, correct: boolean, mode: QuizMode) => void;
  logSession: (session: Omit<StudySession, "id" | "timestamp" | "date">) => void;
  toggleFavorite: (characterId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  celebration: Achievement | null;
  dismissCelebration: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());
  const [celebration, setCelebration] = useState<Achievement | null>(null);
  const pendingXp = useRef(0);

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const applyUnlocks = useCallback((next: ProgressState): ProgressState => {
    const newly = checkNewlyUnlocked(next);
    if (newly.length === 0) return next;
    setCelebration(newly[0]);
    const unlockedIds = new Set(newly.map((a) => a.id));
    return {
      ...next,
      achievements: next.achievements.map((a) => (unlockedIds.has(a.id) ? { ...a, unlockedAt: Date.now() } : a)),
    };
  }, []);

  const recordAnswer = useCallback(
    (characterId: string, correct: boolean, mode: QuizMode) => {
      setState((prev) => {
        const existing = prev.characterStats[characterId] ?? defaultStat(characterId);
        const updatedStat = updateStatAfterAnswer(existing, correct);
        const xpGain = xpForAnswer({ correct, mode });
        const { level } = levelFromTotalXp(prev.xp + xpGain);
        let next: ProgressState = {
          ...prev,
          xp: prev.xp + xpGain,
          level,
          characterStats: { ...prev.characterStats, [characterId]: updatedStat },
        };
        next = applyUnlocks(next);
        return next;
      });
    },
    [applyUnlocks]
  );

  const logSession = useCallback(
    (session: Omit<StudySession, "id" | "timestamp" | "date">) => {
      setState((prev) => {
        const today = todayIso();
        let currentStreak = prev.currentStreak;
        if (prev.lastStudyDate === null) {
          currentStreak = 1;
        } else if (prev.lastStudyDate === today) {
          currentStreak = prev.currentStreak;
        } else if (daysBetween(prev.lastStudyDate, today) === 1) {
          currentStreak = prev.currentStreak + 1;
        } else {
          currentStreak = 1;
        }
        const longestStreak = Math.max(prev.longestStreak, currentStreak);
        const full: StudySession = {
          ...session,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          date: today,
        };
        let next: ProgressState = {
          ...prev,
          sessions: [...prev.sessions, full],
          currentStreak,
          longestStreak,
          lastStudyDate: today,
          totalStudySeconds: prev.totalStudySeconds + session.durationSec,
        };
        next = applyUnlocks(next);
        return next;
      });
    },
    [applyUnlocks]
  );

  const toggleFavorite = useCallback((characterId: string) => {
    setState((prev) => {
      const existing = prev.characterStats[characterId] ?? defaultStat(characterId);
      return {
        ...prev,
        characterStats: { ...prev.characterStats, [characterId]: { ...existing, favorite: !existing.favorite } },
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setState(createDefaultProgress());
  }, []);

  const exportJson = useCallback(() => exportProgressJson(state), [state]);

  const importJson = useCallback((json: string) => {
    try {
      const parsed = parseImportedProgress(json);
      setState(parsed);
      return true;
    } catch (err) {
      console.error("Import failed", err);
      return false;
    }
  }, []);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  // avoid unused var lint in case pendingXp unused across renders
  void pendingXp;

  return (
    <ProgressContext.Provider
      value={{ state, recordAnswer, logSession, toggleFavorite, updateSettings, resetProgress, exportJson, importJson, celebration, dismissCelebration }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
