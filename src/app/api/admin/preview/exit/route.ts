import { NextResponse } from "next/server";
import { draftMode } from "next/headers";

export async function GET(req: Request) {
  const dm = await draftMode();
  dm.disable();
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("redirect") || "/";
  const safe = to.startsWith("/") ? to : "/";
  return NextResponse.redirect(new URL(safe, req.url));
}
