import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    // Regular user auth setup
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Admin user auth setup
    {
      name: "admin-setup",
      testMatch: /admin\.setup\.ts/,
    },
    // Main test project — depends on both setups
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup", "admin-setup"],
    },
  ],
  webServer: [
    {
      // Always start a fresh server so DATABASE_URL is always strawhats_test.
      // If port 3001 is in use, stop your dev server before running tests.
      command: "npm run dev --workspace=server",
      cwd: "../",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: false,
      env: {
        DATABASE_URL:
          process.env.TEST_DATABASE_URL ??
          "postgresql://aokiji@localhost:5432/strawhats_test",
      },
    },
    {
      command: "npm run dev --workspace=client",
      cwd: "../",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
