import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/mall-admin/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true
      }
    }
  }
});
