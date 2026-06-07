import "server-only";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { SESSION_COOKIE } from "./auth-shared";

export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return argonHash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argonVerify(hash, password);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Create a DB session and set the httpOnly cookie. Returns the raw token.
export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string } = {}
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Resolve the current user from the session cookie, or null.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.user;
}

// Guard for admin server components & server actions. Redirects to login if
// there is no valid session. Security is enforced here at the data layer.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}

// --- Login rate limiting via the LoginAttempt audit log ---
const MAX_FAILURES = 5;
const WINDOW_MINUTES = 15;

export async function isRateLimited(ip: string | undefined): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const failures = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: since } },
  });
  return failures >= MAX_FAILURES;
}

export async function recordLoginAttempt(args: {
  email: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
}): Promise<void> {
  await prisma.loginAttempt.create({ data: args });
}
