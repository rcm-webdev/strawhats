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
    // Auth setup runs first — logs in and saves session to playwright/.auth/user.json
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    // Main test project — depends on setup, starts with a signed-in session
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
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
