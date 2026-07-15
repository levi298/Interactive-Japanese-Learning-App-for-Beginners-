import { useEffect, useState } from "react";
import { ProgressProvider, useProgress } from "./context/ProgressContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { CommandPalette } from "./components/layout/CommandPalette";
import { AchievementToast } from "./components/layout/AchievementToast";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useKanaBridge } from "./hooks/useKanaBridge";
import { useAllKanaData } from "./hooks/useKanaData";
import { DashboardPage } from "./pages/Dashboard";
import { HiraganaPage } from "./pages/Hiragana";
import { KatakanaPage } from "./pages/Katakana";
import { PracticePage } from "./pages/Practice";
import { ProgressPage } from "./pages/Progress";
import { AchievementsPage } from "./pages/Achievements";
import { StatisticsPage } from "./pages/Statistics";
import { SettingsPage } from "./pages/Settings";

export type { PageId } from "./context/NavigationContext";

function AppShell() {
  const { page, setPage, jumpToCharacter } = useNavigation();
  const { celebration, dismissCelebration, exportJson, importJson } = useProgress();
  const { all } = useAllKanaData();
  const bridge = useKanaBridge();
  const [searchOpen, setSearchOpen] = useState(false);

  useGlobalShortcuts({
    onSearch: () => setSearchOpen(true),
    onEscape: () => setSearchOpen(false),
  });

  // Native "File" menu Export/Import wiring (no-op fallback in plain browser dev mode).
  useEffect(() => {
    bridge.menu.onExport(async () => {
      await bridge.data.export(exportJson());
    });
    bridge.menu.onImport(async () => {
      const res = await bridge.data.import();
      if (!res.canceled && res.contents) importJson(res.contents);
    });
  }, [bridge, exportJson, importJson]);

  return (
    <div className="app-shell">
      <TitleBar />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar page={page} onNavigate={setPage} onOpenSearch={() => setSearchOpen(true)} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {page === "dashboard" && <DashboardPage />}
          {page === "hiragana" && <HiraganaPage />}
          {page === "katakana" && <KatakanaPage />}
          {page === "practice" && <PracticePage />}
          {page === "progress" && <ProgressPage />}
          {page === "achievements" && <AchievementsPage />}
          {page === "statistics" && <StatisticsPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        characters={all}
        onSelect={(char) => jumpToCharacter(char)}
      />
      <AchievementToast achievement={celebration} onDismiss={dismissCelebration} />
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <ThemeProvider>
        <NavigationProvider>
          <AppShell />
        </NavigationProvider>
      </ThemeProvider>
    </ProgressProvider>
  );
}
