import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the renderer (React) process.
// base: "./" is required so the built app loads correctly
// from the local filesystem when packaged by Electron.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
