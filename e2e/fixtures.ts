import { test as base, expect, type APIRequestContext } from "@playwright/test";

// Extend the base test with project-specific fixtures.
// Import this instead of @playwright/test in all test files.

type Fixtures = {
  // An authenticated API request context that talks directly to the server.
  // Use this in tests that are verifying API behavior without a browser.
  apiContext: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      storageState: "playwright/.auth/user.json",
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };
