import { useEffect } from "react";

export function useGlobalShortcuts(opts: { onSearch: () => void; onEscape: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "f")) {
        e.preventDefault();
        opts.onSearch();
      } else if (e.key === "Escape") {
        opts.onEscape();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [opts]);
}
