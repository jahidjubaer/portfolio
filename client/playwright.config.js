import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Build-time only, and every real submission is intercepted below via
      // page.route — this never reaches Web3Forms. It exists so the client
      // takes the "submit" code path instead of the "key missing" fail-safe.
      VITE_WEB3FORMS_ACCESS_KEY: "e2e-test-placeholder-key",
    },
  },
});
