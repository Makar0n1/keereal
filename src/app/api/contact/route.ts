import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema, MIN_FILL_MS } from "@/lib/validation";
import { getClientIp, getUserAgent } from "@/lib/request";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { resolveVisitor } from "@/lib/visitor";

export async function POST(req: Request) {
  sweep();
  const ip = await getClientIp();

  // IP rate limit: 5 submissions / hour.
  const rl = rateLimit(`contact:${ip ?? "unknown"}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много заявок. Попробуйте позже." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Проверьте поля формы" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Honeypot: bots fill the hidden field.
  if (data.website && data.website.trim() !== "") {
    // Pretend success to not tip off bots.
    return NextResponse.json({ ok: true });
  }

  // Too-fast submission is almost certainly a bot.
  if (data.elapsedMs > 0 && data.elapsedMs < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  // Tie this lead to the unified person (links it with any live-chat thread
  // from the same browser or matching contact).
  const visitor = await resolveVisitor({
    name: data.name,
    contact: data.contact,
    ip,
    userAgent: await getUserAgent(),
  });

  await prisma.lead.create({
    data: {
      name: data.name,
      contact: data.contact,
      message: data.message,
      pageSource: data.pageSource || null,
      ip: ip ?? null,
      visitorId: visitor.id,
    },
  });

  return NextResponse.json({ ok: true });
}
