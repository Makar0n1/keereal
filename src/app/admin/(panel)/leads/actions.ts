"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { leadUpdateSchema } from "@/lib/validation";

export async function updateLead(input: unknown) {
  await requireUser();
  const parsed = leadUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Некорректные данные" };
  const { id, status, note } = parsed.data;

  await prisma.lead.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(note !== undefined ? { note } : {}),
    },
  });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteLead(id: string) {
  await requireUser();
  await prisma.lead.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true as const };
}
