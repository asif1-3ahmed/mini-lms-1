import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // 📦 Resolve .js and .jsx extensions explicitly
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 🧱 Output configuration for Render compatibility
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },

  // 🧩 Local dev server
  server: {
    port: 5173,
    open: true,
    host: true,
  },
});