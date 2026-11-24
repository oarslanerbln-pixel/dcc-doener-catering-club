import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const DEFAULT_BASE_URL = 'http://127.0.0.1:4173';
const CHROME_EXE = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_EXE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function resolveBrowserChannel(): 'chrome' | 'msedge' | undefined {
  const override = process.env.PLAYWRIGHT_CHANNEL?.trim().toLowerCase();
  if (override === 'chrome') return 'chrome';
  if (override === 'msedge' || override === 'edge') return 'msedge';
  if (override === 'chromium' || override === 'none') return undefined;

  if (existsSync(CHROME_EXE)) return 'chrome';
  if (existsSync(EDGE_EXE)) return 'msedge';
  return undefined;
}

const rawBaseUrl = process.env.BASE_URL?.trim();
const baseURL = rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : DEFAULT_BASE_URL;
const useExternalBaseUrl = Boolean(rawBaseUrl && rawBaseUrl.length > 0);
const channel = resolveBrowserChannel();

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    permissions: ['clipboard-read', 'clipboard-write'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        ...(channel ? { channel } : {}),
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        ...(channel ? { channel } : {}),
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: useExternalBaseUrl
    ? undefined
    : {
        command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
        url: DEFAULT_BASE_URL,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
