import { contextBridge, ipcRenderer } from "electron";

// Everything the renderer is allowed to touch on the native side.
// Kept intentionally small: window chrome controls + file-based
// import/export for progress data. No filesystem/network access
// is exposed beyond this.
contextBridge.exposeInMainWorld("kana", {
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximizeToggle: () => ipcRenderer.send("window:maximize-toggle"),
    close: () => ipcRenderer.send("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximizedChange: (cb: (isMaximized: boolean) => void) => {
      const listener = (_e: unknown, val: boolean) => cb(val);
      ipcRenderer.on("window:maximized", listener);
      return () => ipcRenderer.removeListener("window:maximized", listener);
    },
  },
  data: {
    export: (json: string) => ipcRenderer.invoke("data:export", json),
    import: () => ipcRenderer.invoke("data:import"),
  },
  menu: {
    onExport: (cb: () => void) => ipcRenderer.on("menu:export", cb),
    onImport: (cb: () => void) => ipcRenderer.on("menu:import", cb),
    onAbout: (cb: () => void) => ipcRenderer.on("menu:about", cb),
  },
  platform: process.platform,
  isElectron: true,
});
