"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";

export async function updateSettings(input: unknown) {
  await requireUser();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Ошибка валидации" };
  }
  await prisma.setting.upsert({
    where: { id: "global" },
    update: parsed.data,
    create: { id: "global", ...parsed.data },
  });
  // Settings affect the whole public site.
  revalidatePath("/", "layout");
  return { ok: true as const };
}
