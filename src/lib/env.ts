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

if (!parsed.success) {
  // Surface a clear error during build/start instead of obscure runtime crashes.
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
