import { useMemo } from "react";

/**
 * Wraps window.kana (injected by Electron's preload script) so the app
 * still runs sensibly with `vite dev` in a plain browser tab — window
 * controls become no-ops and export/import fall back to a browser
 * download / file picker.
 */
export function useKanaBridge() {
  return useMemo(() => {
    if (window.kana) return window.kana;

    const fallback: NonNullable<Window["kana"]> = {
      window: {
        minimize: () => {},
        maximizeToggle: () => {},
        close: () => {},
        isMaximized: async () => false,
        onMaximizedChange: () => () => {},
      },
      data: {
        export: async (json: string) => {
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `kana-progress-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          return { canceled: false };
        },
        import: async () => {
          return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return resolve({ canceled: true });
              const reader = new FileReader();
              reader.onload = () => resolve({ canceled: false, contents: String(reader.result) });
              reader.readAsText(file);
            };
            input.click();
          });
        },
      },
      menu: { onExport: () => {}, onImport: () => {}, onAbout: () => {} },
      platform: "web",
      isElectron: true,
    };
    return fallback;
  }, []);
}
