import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  testDir: 'tests/e2e',
  testMatch: ['**/*.spec.ts'],
  testIgnore: ['supabase/**', '**/__tests__/**', '**/*.test.ts'],
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
