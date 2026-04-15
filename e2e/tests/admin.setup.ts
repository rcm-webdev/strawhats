import { test as setup, expect } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

// Load server env so Prisma can connect to the database
dotenv.config({ path: path.join(__dirname, "../../server/.env") });

// Import after dotenv so DATABASE_URL is available
const { prisma } = await import("../../server/src/db/prisma");

const adminAuthFile = path.join(__dirname, "../playwright/.auth/admin.json");

setup("authenticate admin", async ({ request }) => {
  const email = process.env.E2E_ADMIN_EMAIL ?? "admin@strawhats.test";
  const password = process.env.E2E_ADMIN_PASSWORD ?? "admin-password-123";

  // Sign up (idempotent — 400 if already exists, which is fine)
  await request.post("http://localhost:3001/api/auth/sign-up/email", {
    data: { email, password, name: "E2E Admin" },
  });

  // Promote to admin directly via Prisma
  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  // Sign in and save the session
  const signInResponse = await request.post(
    "http://localhost:3001/api/auth/sign-in/email",
    { data: { email, password } }
  );
  expect(signInResponse.ok()).toBeTruthy();

  await request.storageState({ path: adminAuthFile });
});
