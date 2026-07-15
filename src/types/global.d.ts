export {};

declare global {
  interface KanaBridge {
    window: {
      minimize: () => void;
      maximizeToggle: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizedChange: (cb: (isMaximized: boolean) => void) => () => void;
    };
    data: {
      export: (json: string) => Promise<{ canceled: boolean; filePath?: string }>;
      import: () => Promise<{ canceled: boolean; contents?: string }>;
    };
    menu: {
      onExport: (cb: () => void) => void;
      onImport: (cb: () => void) => void;
      onAbout: (cb: () => void) => void;
    };
    platform: string;
    isElectron: true;
  }

  interface Window {
    kana?: KanaBridge;
  }
}
