import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from "electron";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Kana — Electron main process
//
// Responsibilities:
//  - Create the frameless main window (custom title bar lives in the renderer)
//  - Wire up minimize/maximize/close IPC for that custom title bar
//  - Provide native "Save/Open" dialogs for progress export/import
//  - Register a minimal native application menu (with keyboard accelerators)
// ---------------------------------------------------------------------------

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    show: false,
    backgroundColor: "#14161c",
    frame: false,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "../public/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  mainWindow.on("maximize", () => mainWindow?.webContents.send("window:maximized", true));
  mainWindow.on("unmaximize", () => mainWindow?.webContents.send("window:maximized", false));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open external links (e.g. a GitHub link in Settings) in the OS browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        { label: "Export Progress...", click: () => mainWindow?.webContents.send("menu:export") },
        { label: "Import Progress...", click: () => mainWindow?.webContents.send("menu:import") },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Kana",
          click: () => mainWindow?.webContents.send("menu:about"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------------------------------------------------------------------------
// IPC: custom title bar window controls
// ---------------------------------------------------------------------------
ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:maximize-toggle", () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on("window:close", () => mainWindow?.close());
ipcMain.handle("window:is-maximized", () => mainWindow?.isMaximized() ?? false);

// ---------------------------------------------------------------------------
// IPC: local data export / import (native file dialogs)
// ---------------------------------------------------------------------------
ipcMain.handle("data:export", async (_e, jsonString: string) => {
  if (!mainWindow) return { canceled: true };
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Export Kana Progress",
    defaultPath: `kana-progress-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePath) return { canceled: true };
  fs.writeFileSync(filePath, jsonString, "utf-8");
  return { canceled: false, filePath };
});

ipcMain.handle("data:import", async () => {
  if (!mainWindow) return { canceled: true };
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Import Kana Progress",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || filePaths.length === 0) return { canceled: true };
  const contents = fs.readFileSync(filePaths[0], "utf-8");
  return { canceled: false, contents };
});
