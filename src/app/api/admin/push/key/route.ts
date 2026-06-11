import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

// The VAPID public key the client needs to subscribe. Served at runtime (not
// inlined at build) so it works without a Docker build arg. Push is "enabled"
// only when a key is configured.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  return NextResponse.json({
    enabled: Boolean(env.VAPID_PUBLIC_KEY),
    publicKey: env.VAPID_PUBLIC_KEY || null,
  });
}
