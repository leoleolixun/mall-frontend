import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: 'http://127.0.0.1:4175/mobile/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    {
      name: 'wechat-h5',
      use: {
        ...devices['Pixel 7'],
        userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Mobile MicroMessenger/8.0.60'
      }
    }
  ],
  webServer: {
    command: 'node tests/h5-server.mjs',
    url: 'http://127.0.0.1:4175/mobile/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
})
