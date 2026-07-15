import { LayoutDashboard, Languages, Zap, TrendingUp, Award, BarChart3, Settings as SettingsIcon, Search } from "lucide-react";
import type { PageId } from "../../context/NavigationContext";
import { APP_TAGLINE } from "../../config/app.config";

const NAV: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "hiragana", label: "Hiragana", icon: <Languages size={18} /> },
  { id: "katakana", label: "Katakana", icon: <Languages size={18} /> },
  { id: "practice", label: "Practice", icon: <Zap size={18} /> },
  { id: "progress", label: "Progress", icon: <TrendingUp size={18} /> },
  { id: "achievements", label: "Achievements", icon: <Award size={18} /> },
  { id: "statistics", label: "Statistics", icon: <BarChart3 size={18} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
];

export function Sidebar({ page, onNavigate, onOpenSearch }: { page: PageId; onNavigate: (p: PageId) => void; onOpenSearch: () => void }) {
  return (
    <nav
      style={{
        width: 232,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        padding: "16px 12px",
      }}
    >
      <button
        onClick={onOpenSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-tertiary)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 18,
        }}
      >
        <Search size={14} />
        <span style={{ flex: 1, textAlign: "left" }}>Search characters...</span>
        <kbd style={{ fontSize: 11, background: "var(--bg-inset)", padding: "2px 5px", borderRadius: 4 }}>Ctrl K</kbd>
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent-strong)" : "var(--text-secondary)",
                fontWeight: active ? 600 : 500,
                fontSize: 13.5,
                cursor: "pointer",
                textAlign: "left",
                transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--bg-inset)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "10px 12px", fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.5 }}>{APP_TAGLINE}</div>
    </nav>
  );
}
