import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

// Enable draft preview. Protected: only an authenticated admin can turn it on.
// Usage: /api/admin/preview?redirect=/projects/some-slug
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("redirect") || "/";
  const dm = await draftMode();
  dm.enable();
  // Only allow internal redirects.
  const safe = to.startsWith("/") ? to : "/";
  return NextResponse.redirect(new URL(safe, req.url));
}
