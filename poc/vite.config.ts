/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/quintet/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@themes": path.resolve(__dirname, "themes"),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "e2e/**"],
  },
}));
