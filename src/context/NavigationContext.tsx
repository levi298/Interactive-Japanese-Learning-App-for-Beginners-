import React, { createContext, useContext, useState, useCallback } from "react";
import type { KanaCharacter, RowId, ScriptId } from "../types/kana";
import type { QuizMode } from "../types/progress";

export type PageId = "dashboard" | "hiragana" | "katakana" | "practice" | "progress" | "achievements" | "statistics" | "settings";

export interface PracticeConfig {
  script: ScriptId | "mixed";
  rows: RowId[] | "all";
  source: "all" | "row" | "weak" | "favorites" | "random";
  mode: QuizMode;
}

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = { script: "mixed", rows: "all", source: "all", mode: "multiple-choice" };

interface NavigationContextValue {
  page: PageId;
  setPage: (p: PageId) => void;
  practiceConfig: PracticeConfig;
  autoStartPractice: boolean;
  consumeAutoStart: () => void;
  launchPractice: (config: PracticeConfig) => void;
  jumpTarget: KanaCharacter | null;
  jumpToCharacter: (char: KanaCharacter) => void;
  clearJumpTarget: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageId>("dashboard");
  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig>(DEFAULT_PRACTICE_CONFIG);
  const [jumpTarget, setJumpTarget] = useState<KanaCharacter | null>(null);
  const [autoStartPractice, setAutoStartPractice] = useState(false);

  const launchPractice = useCallback((config: PracticeConfig) => {
    setPracticeConfig(config);
    setAutoStartPractice(true);
    setPage("practice");
  }, []);

  const consumeAutoStart = useCallback(() => setAutoStartPractice(false), []);

  const jumpToCharacter = useCallback((char: KanaCharacter) => {
    setJumpTarget(char);
    setPage(char.script);
  }, []);

  const clearJumpTarget = useCallback(() => setJumpTarget(null), []);

  return (
    <NavigationContext.Provider
      value={{ page, setPage, practiceConfig, autoStartPractice, consumeAutoStart, launchPractice, jumpTarget, jumpToCharacter, clearJumpTarget }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
