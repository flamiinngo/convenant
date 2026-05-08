import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:   './e2e',
  fullyParallel: true,
  retries:   process.env.CI ? 2 : 0,
  reporter:  'list',
  timeout:   30_000,

  use: {
    baseURL:       'http://localhost:5173',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
  },

  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
    {
      name:  'mobile-chrome',
      use:   { ...devices['Pixel 7'] },
    },
    {
      name:  'mobile-safari',
      use:   { ...devices['iPhone 14'] },
    },
  ],

  webServer: {
    command:            'npm run dev',
    url:                'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout:            30_000,
  },
})
