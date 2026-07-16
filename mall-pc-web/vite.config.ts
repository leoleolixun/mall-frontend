import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "~components": new URL("./src/shared/components", import.meta.url).pathname,
      "~features": new URL("./src/features", import.meta.url).pathname,
      "~types": new URL("./src/shared/types", import.meta.url).pathname
    }
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
