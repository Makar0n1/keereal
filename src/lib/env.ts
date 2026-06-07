import { z } from "zod";

// Validate environment at boot. Server-only values must never be imported
// into client components.
const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 chars"),
  UPLOADS_DIR: z.string().default("./uploads"),
  UPLOADS_PUBLIC_PREFIX: z.string().default("/uploads"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = serverSchema.safeParse(process.env);

// During `next build` the runtime secrets (DB/session) aren't present — Next.js
// only collects page data. Don't fail the build; they ARE validated when the
// server actually starts (NEXT_PHASE is unset at runtime).
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

if (!parsed.success && !isBuild) {
  // Surface a clear error during start instead of obscure runtime crashes.
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "",
      UPLOADS_DIR: process.env.UPLOADS_DIR ?? "./uploads",
      UPLOADS_PUBLIC_PREFIX: process.env.UPLOADS_PUBLIC_PREFIX ?? "/uploads",
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") ?? "production",
    };

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
