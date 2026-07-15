import { useState } from "react";
import { Sun, Moon, Monitor, Download, Upload, Trash2 } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useKanaBridge } from "../hooks/useKanaBridge";
import type { AccentColor, ThemeMode } from "../types/progress";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { PageShell } from "./KanaScriptPage";

const ACCENTS: { id: AccentColor; label: string; color: string }[] = [
  { id: "indigo", label: "Indigo (Ai-iro)", color: "#3d5a99" },
  { id: "vermillion", label: "Vermillion", color: "#c4453d" },
  { id: "matcha", label: "Matcha", color: "#5a7d5a" },
  { id: "sakura", label: "Sakura", color: "#d98ba0" },
  { id: "sumi", label: "Sumi ink", color: "#4a4a52" },
];

export function SettingsPage() {
  const { state, updateSettings, resetProgress, exportJson, importJson } = useProgress();
  const bridge = useKanaBridge();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const { settings } = state;

  async function handleExport() {
    const json = exportJson();
    const res = await bridge.data.export(json);
    if (!res.canceled) setImportStatus("Progress exported successfully.");
  }

  async function handleImport() {
    const res = await bridge.data.import();
    if (res.canceled || !res.contents) return;
    const ok = importJson(res.contents);
    setImportStatus(ok ? "Progress imported successfully." : "That file couldn't be read as valid progress data.");
  }

  return (
    <PageShell title="Settings" subtitle="Personalize the app and manage your data.">
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>Appearance</SectionTitle>
        <Row label="Theme">
          <SegButton active={settings.theme === "light"} onClick={() => updateSettings({ theme: "light" as ThemeMode })} icon={<Sun size={14} />} label="Light" />
          <SegButton active={settings.theme === "dark"} onClick={() => updateSettings({ theme: "dark" as ThemeMode })} icon={<Moon size={14} />} label="Dark" />
          <SegButton active={settings.theme === "system"} onClick={() => updateSettings({ theme: "system" as ThemeMode })} icon={<Monitor size={14} />} label="System" />
        </Row>
        <Row label="Accent color">
          <div style={{ display: "flex", gap: 8 }}>
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => updateSettings({ accent: a.id })}
                title={a.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: a.color,
                  border: settings.accent === a.id ? "3px solid var(--text)" : "3px solid transparent",
                  cursor: "pointer",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </Row>
        <Row label="Font size">
          <SegButton active={settings.fontSize === "sm"} onClick={() => updateSettings({ fontSize: "sm" })} label="Small" />
          <SegButton active={settings.fontSize === "md"} onClick={() => updateSettings({ fontSize: "md" })} label="Medium" />
          <SegButton active={settings.fontSize === "lg"} onClick={() => updateSettings({ fontSize: "lg" })} label="Large" />
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>Behavior</SectionTitle>
        <Row label="Animations">
          <Toggle checked={settings.animations} onChange={(v) => updateSettings({ animations: v })} />
        </Row>
        <Row label="Sound effects">
          <Toggle checked={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
        </Row>
        <Row label="Daily goal (minutes)">
          <input
            type="number"
            min={5}
            max={180}
            value={settings.dailyGoalMinutes}
            onChange={(e) => updateSettings({ dailyGoalMinutes: Number(e.target.value) || 15 })}
            style={{ width: 70, padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-inset)", color: "var(--text)" }}
          />
        </Row>
      </Card>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginBottom: 14 }}>
          Everything is stored locally on this device — nothing is ever sent anywhere. Export a backup or move your progress to another computer.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport}>
            Export data
          </Button>
          <Button variant="secondary" icon={<Upload size={15} />} onClick={handleImport}>
            Import data
          </Button>
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setConfirmReset(true)}>
            Reset progress
          </Button>
        </div>
        {importStatus && <p style={{ fontSize: 12, color: "var(--accent-strong)", marginTop: 10 }}>{importStatus}</p>}
      </Card>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all progress?">
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
          This permanently deletes your XP, streaks, achievements, and character stats on this device. This can't be undone — consider exporting a
          backup first.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetProgress();
              setConfirmReset(false);
            }}
          >
            Reset everything
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{children}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>{children}</div>
    </div>
  );
}

function SegButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
        color: active ? "var(--accent-strong)" : "var(--text-secondary)",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: 40,
        height: 22,
        borderRadius: "var(--radius-full)",
        background: checked ? "var(--accent)" : "var(--bg-inset)",
        border: "1px solid var(--border)",
        position: "relative",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-out)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left var(--dur-fast) var(--ease-out)",
          boxShadow: "var(--shadow-sm)",
        }}
      />
    </button>
  );
}
