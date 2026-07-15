import React, { createContext, useContext, useEffect } from "react";
import { useProgress } from "./ProgressContext";

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: "dark" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useProgress();
  const { theme, accent, fontSize, animations } = state.settings;

  const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  const resolvedTheme: "light" | "dark" = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.accent = accent;
    root.dataset.fontSize = fontSize;
    root.dataset.animations = animations ? "on" : "off";
  }, [resolvedTheme, accent, fontSize, animations]);

  return <ThemeContext.Provider value={{ resolvedTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
