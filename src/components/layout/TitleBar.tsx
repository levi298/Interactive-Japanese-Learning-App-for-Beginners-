import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { APP_NAME } from "../../config/app.config";
import { useKanaBridge } from "../../hooks/useKanaBridge";

export function TitleBar() {
  const bridge = useKanaBridge();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    bridge.window.isMaximized().then(setMaximized);
    const unsub = bridge.window.onMaximizedChange(setMaximized);
    return unsub;
  }, [bridge]);

  return (
    <div
      className="drag"
      style={{
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0 0 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <HankoMark size={18} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 700, color: "var(--text-secondary)" }}>{APP_NAME}</span>
      </div>
      <div className="no-drag" style={{ display: "flex", height: "100%" }}>
        <WinButton onClick={() => bridge.window.minimize()} label="Minimize">
          <Minus size={14} />
        </WinButton>
        <WinButton onClick={() => bridge.window.maximizeToggle()} label="Maximize">
          {maximized ? <Copy size={12} /> : <Square size={12} />}
        </WinButton>
        <WinButton onClick={() => bridge.window.close()} label="Close" danger>
          <X size={15} />
        </WinButton>
      </div>
    </div>
  );
}

function WinButton({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 46,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "var(--vermillion)" : "var(--bg-inset)";
        e.currentTarget.style.color = danger ? "#fff" : "var(--text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

/** The app's signature mark: a simplified hanko (ink stamp) seal. */
export function HankoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="6" stroke="var(--accent)" strokeWidth="2.5" />
      <rect x="9" y="9" width="14" height="14" rx="2" fill="var(--accent)" />
    </svg>
  );
}
