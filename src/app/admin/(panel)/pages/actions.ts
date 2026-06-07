"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publishStatus } from "@/lib/validation";

export async function updatePageStatus(pageId: string, status: unknown) {
  await requireUser();
  const parsed = publishStatus.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "Некорректный статус" };

  const page = await prisma.page.update({
    where: { id: pageId },
    data: { status: parsed.data },
  });
  if (page.key) revalidatePath(`/${page.key}`);
  return { ok: true as const };
}
