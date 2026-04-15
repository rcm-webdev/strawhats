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
      command: "npm run dev --workspace=server",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev --workspace=client",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
