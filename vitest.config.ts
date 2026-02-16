import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "src/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["tests/bench/**"],
    setupFiles: ["src/__tests__/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
