import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/bench/**"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
