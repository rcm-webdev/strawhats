import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "../db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh if older than 1 day
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
  ],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
    "http://localhost:5173",
  ],
});

export type Session = typeof auth.$Infer.Session;
