import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Browser journeys only; Node unit tests run with `npm test`.
// In environments with a preinstalled Chromium (e.g. PW_CHROMIUM_PATH or
// /opt/pw-browsers), use it instead of downloading; CI runs `playwright install`.
const preinstalled = [process.env.PW_CHROMIUM_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(
  (path) => path && existsSync(path),
)

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    ...devices['Desktop Chrome'],
    launchOptions: preinstalled ? { executablePath: preinstalled } : {},
  },
  webServer: {
    // Production preview of the real build, not the dev server.
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
