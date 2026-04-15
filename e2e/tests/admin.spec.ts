import { test, expect } from "../fixtures";

test.describe("Admin API", () => {
  test.describe("GET /api/admin/users", () => {
    test("returns 401 for unauthenticated requests", async ({ playwright }) => {
      const ctx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
      });
      const response = await ctx.get("/api/admin/users");
      expect(response.status()).toBe(401);
      await ctx.dispose();
    });

    test("returns 403 for regular user", async ({ apiContext }) => {
      const response = await apiContext.get("/api/admin/users");
      expect(response.status()).toBe(403);
    });

    test("returns user list with counts for admin", async ({ adminApiContext }) => {
      const response = await adminApiContext.get("/api/admin/users");
      expect(response.ok()).toBeTruthy();
      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      const user = users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("banned");
      expect(user).toHaveProperty("binCount");
      expect(user).toHaveProperty("itemCount");
      expect(typeof user.binCount).toBe("number");
      expect(typeof user.itemCount).toBe("number");
    });
  });

  test.describe("POST /api/admin/users/:id/ban and unban", () => {
    test("returns 403 for regular user", async ({ apiContext, adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const regularUser = users.find((u: { role: string | null }) => u.role !== "admin");
      expect(regularUser).toBeDefined();

      const response = await apiContext.post(`/api/admin/users/${regularUser.id}/ban`);
      expect(response.status()).toBe(403);
    });

    test("admin can ban and unban a user", async ({ adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const regularUser = users.find((u: { role: string | null; email: string }) =>
        u.role !== "admin" && u.email !== "admin@strawhats.test"
      );
      expect(regularUser).toBeDefined();

      // Ban
      const banResponse = await adminApiContext.post(
        `/api/admin/users/${regularUser.id}/ban`
      );
      expect(banResponse.ok()).toBeTruthy();

      // Confirm banned
      const afterBan = await adminApiContext.get("/api/admin/users");
      const afterBanUsers = await afterBan.json();
      const banned = afterBanUsers.find((u: { id: string }) => u.id === regularUser.id);
      expect(banned.banned).toBe(true);

      // Unban
      const unbanResponse = await adminApiContext.post(
        `/api/admin/users/${regularUser.id}/unban`
      );
      expect(unbanResponse.ok()).toBeTruthy();

      // Confirm unbanned
      const afterUnban = await adminApiContext.get("/api/admin/users");
      const afterUnbanUsers = await afterUnban.json();
      const unbanned = afterUnbanUsers.find((u: { id: string }) => u.id === regularUser.id);
      expect(unbanned.banned).toBe(false);
    });

    test("admin cannot ban themselves", async ({ adminApiContext }) => {
      const meResponse = await adminApiContext.get("/api/admin/users");
      const users = await meResponse.json();
      const adminUser = users.find((u: { email: string }) => u.email === "admin@strawhats.test");
      expect(adminUser).toBeDefined();

      const response = await adminApiContext.post(`/api/admin/users/${adminUser.id}/ban`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("DELETE /api/admin/users/:id", () => {
    test("returns 403 for regular user", async ({ apiContext, adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const regularUser = users.find((u: { role: string | null }) => u.role !== "admin");

      const response = await apiContext.delete(`/api/admin/users/${regularUser.id}`);
      expect(response.status()).toBe(403);
    });

    test("admin cannot delete themselves", async ({ adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const adminUser = users.find((u: { email: string }) => u.email === "admin@strawhats.test");

      const response = await adminApiContext.delete(`/api/admin/users/${adminUser.id}`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("ban invalidates session", () => {
    test("banned user cannot access protected routes", async ({ adminApiContext, playwright }) => {
      // Get a non-admin user to ban
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const regularUser = users.find((u: { role: string | null; email: string }) =>
        u.role !== "admin" && u.email !== "admin@strawhats.test"
      );
      expect(regularUser).toBeDefined();

      // Create a context for the regular user using the existing session
      const userCtx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        storageState: "playwright/.auth/user.json",
      });

      // Verify the user can access bins before ban
      const beforeBan = await userCtx.get("/api/bins");
      expect(beforeBan.ok()).toBeTruthy();

      // Ban the user
      await adminApiContext.post(`/api/admin/users/${regularUser.id}/ban`);

      // After ban, the user's sessions are deleted — existing session cookie should fail
      const afterBan = await userCtx.get("/api/bins");
      expect(afterBan.status()).toBe(401);

      await userCtx.dispose();

      // Restore: unban so other tests still work
      await adminApiContext.post(`/api/admin/users/${regularUser.id}/unban`);
    });
  });
});
