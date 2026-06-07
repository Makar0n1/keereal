"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSession,
  isRateLimited,
  recordLoginAttempt,
} from "@/lib/auth";
import { getClientIp, getUserAgent } from "@/lib/request";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await getClientIp();
  const userAgent = await getUserAgent();

  if (await isRateLimited(ip)) {
    return { error: "Слишком много попыток. Повторите через 15 минут." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Проверьте поля" };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  const ok = user ? await verifyPassword(user.passwordHash, password) : false;

  await recordLoginAttempt({ email, ip, userAgent, success: ok });

  if (!ok || !user) {
    return { error: "Неверный email или пароль" };
  }

  await createSession(user.id, { ip, userAgent });
  redirect("/admin");
}
