import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173/mall-admin/",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"]
  },
  webServer: [
    {
      command: "PORT=18080 node tests/fixtures/merchant-api-server.mjs",
      url: "http://127.0.0.1:18080/api/v1/__requests",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    },
    {
      command: "VITE_API_BASE_URL=http://127.0.0.1:18080/api/v1 npm run dev -- --port 4173 --strictPort",
      url: "http://127.0.0.1:4173/mall-admin/",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    }
  ]
});
