<img width="1774" height="887" alt="ChatGPT Image Jul 8, 2026, 08_43_08 PM" src="https://github.com/user-attachments/assets/b55eae28-3387-4ae5-b819-7bf63149e059" />
<img width="2808" height="1536" alt="gemkana3" src="https://github.com/user-attachments/assets/e9b3e0d8-58e1-4e9c-b76b-fff4b645bc34" />
<img width="2612" height="1632" alt="gemkana1" src="https://github.com/user-attachments/assets/871b2014-62c5-4546-9f7e-349beffd3239" />
<img width="2808" height="1536" alt="gemkana2" src="https://github.com/user-attachments/assets/0366d497-25fb-44f3-8497-50fe402f0e18" />
# Kana — Learn Japanese, Offline, on Desktop

A premium, fully offline Windows desktop application for learning Hiragana
and Katakana, built with **Electron + React + TypeScript + Vite**.

No account. No login. No internet required. Everything — progress, XP,
streaks, achievements, favorites, settings — lives in local storage on your
machine.

---

## Features

- **Dashboard** — streak, daily goal, XP/level, accuracy, quick-start actions
- **Hiragana & Katakana modules** — all 104 characters each (base rows,
  dakuten, handakuten, and combination/yōon characters), browsable by row,
  weak characters, or favorites
- **Learn Mode** — large flashcard view with romaji, example word, favoriting,
  and keyboard navigation (← → arrows, Esc)
- **Practice / Quiz modes** — Typing, Multiple Choice, Reverse, Random,
  Weak-character, Timed (30/60/120/custom), and Endless
- **Smart weighting** — characters you get wrong show up more often;
  characters you consistently get right "graduate" to mastered
- **Gamification** — XP, levels, 11 achievements, streaks, daily goals
- **Statistics** — accuracy over time, study time per day, mastery
  breakdown, best day, current streak (charts via Recharts)
- **Search everywhere** — `Ctrl+K` / `Ctrl+F` opens instant search across
  every character by kana, romaji, or meaning
- **Settings** — light/dark/system theme, 5 accent colors, font size,
  animation/sound toggles, daily goal, **export/import progress as JSON**,
  reset progress
- **Native desktop shell** — custom frameless title bar, resizable window
  with sane min size, native File/Edit/View/Help menu, native save/open
  dialogs for backups

## Tech stack

- Electron 30 (main process in `electron/`)
- React 18 + TypeScript, bundled by Vite 5
- Framer Motion for animation, Recharts for charts, Lucide for icons
- No backend, no database — `localStorage` in the renderer, plus native
  file dialogs (via a small `contextBridge` API) for backup export/import

---

## Getting started

```bash
npm install
npm run dev            # Vite dev server only, opens in a normal browser tab
npm run dev:electron   # Vite + Electron together, hot-reloading both
```

> `npm run dev` (browser-only) is handy for fast UI iteration. The
> `window.kana` bridge that talks to Electron's main process gracefully
> falls back to browser-friendly behavior when it isn't present (window
> controls become no-ops, export/import use a normal file download / file
> picker instead of native dialogs) — see `src/hooks/useKanaBridge.ts`.

### Building a Windows installer

```bash
npm run package:win
```

This runs the TypeScript builds for both the renderer and the Electron
main process, then invokes `electron-builder` to produce an NSIS installer
in `release/`. (`npm run package` builds for your current OS.)

> **Note on this sandbox:** dependencies were installed here with
> `ELECTRON_SKIP_BINARY_DOWNLOAD=1` because this environment can't reach
> Electron's binary CDN. On your own machine, run a normal `npm install`
> (no env var needed) so Electron's runtime binary downloads correctly —
> that's required before `npm run dev:electron` or packaging will work.

---

## Renaming the app

Only three places hardcode the app's name:

1. `src/config/app.config.ts` → `APP_NAME`, `APP_TAGLINE`
2. `package.json` → `name`, `productName`
3. `index.html` → `<title>`

Change those and you're done — the title bar, window title, and installer
all pick it up automatically.

---

## Architecture

```
electron/                  Main process (window, menu, IPC, file dialogs)
  main.ts
  preload.ts                contextBridge — the only main<->renderer surface

src/
  config/app.config.ts      Single source of truth for app name/branding
  types/                    Shared TypeScript types (kana, progress, global bridge)
  data/                     (reserved for future bundled data — see resources below)
  utils/
    resourceLoader.ts        Dynamic fetch()-based JSON pack loader
    weighting.ts              Weak-character weighting / mastery logic
  store/
    persistence.ts            localStorage read/write, safe defaults, import/export
    achievements.ts            Achievement definitions + unlock checks
    xp.ts                      XP/level curve
  context/
    ProgressContext.tsx        Global progress state (the "database")
    ThemeContext.tsx            Applies theme/accent/font-size as CSS vars
    NavigationContext.tsx       Page routing + cross-page practice launch
  hooks/                     useKanaData, useKanaBridge, useGlobalShortcuts
  components/
    ui/                       Button, Card, Modal, ProgressBar, Badge — reusable primitives
    layout/                   TitleBar, Sidebar, CommandPalette, AchievementToast
    kana/                     CharacterTile, LearnModePanel
    practice/                 PracticeSetup, PracticeSession
  pages/                     One file per sidebar section

public/resources/
  hiragana.json, katakana.json    The actual character data
  manifest.json                   Registry of available/planned packs
  future/                         Drop-in point for kanji/vocab/grammar packs
```

### The resource pack system

Character data is **not** hardcoded into components. `resourceLoader.ts`
`fetch()`es JSON from `public/resources/` at runtime. To add a new pack
(e.g. Kanji or Vocabulary) later:

1. Drop `kanji.json` into `public/resources/future/` (or wherever you like)
2. Register it in `public/resources/manifest.json`
3. Add a loader call + a page/component to present it

No existing code needs to change — this is what makes the "Future Ready"
modules (Vocabulary, Kanji, Grammar, JLPT packs, etc.) additive rather than
a rewrite.

### Why localStorage instead of a database?

This is a single-user, single-device, offline app — `localStorage` in the
renderer is simple, has zero native dependencies (no rebuild step, no
platform-specific binaries to ship), and is trivially backed up as JSON via
the Export/Import feature. If you outgrow it, `store/persistence.ts` is the
only file that would need to change to swap in e.g. `electron-store` or
SQLite.

---

## Known limitations / good next steps

- Audio pronunciation currently uses the OS's built-in speech synthesis
  (`window.speechSynthesis`) as a placeholder — swap in real recorded audio
  clips per character for a more authentic sound.
- Stroke-order animation, handwriting practice, and the Kanji/Vocabulary/
  Grammar modules are intentionally left as "future ready" scaffolding
  (see `public/resources/future/`) rather than built out, per the resource
  pack system above.
- The production bundle is a single JS chunk; for a larger app, consider
  route-based code-splitting (`React.lazy`) per page.
