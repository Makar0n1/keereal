"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextareaField } from "./fields";
import { buttonClass, Card } from "./ui";
import { cn } from "@/lib/utils";
import { updateSettings } from "@/app/admin/(panel)/settings/actions";
import type { SettingsInput } from "@/lib/validation";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [s, setS] = useState(initial);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateSettings(s);
      setMessage(res.ok ? { type: "ok", text: "Сохранено" } : { type: "err", text: res.error });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      {message ? (
        <div
          className={cn(
            "rounded-md px-3 py-2 text-sm",
            message.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}
        >
          {message.text}
        </div>
      ) : null}

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">Идентичность</h2>
        <TextField label="Имя / название сайта" value={s.siteName} onChange={(v) => set("siteName", v)} />
        <TextField label="Позиционирование (роль)" value={s.role} onChange={(v) => set("role", v)} />
        <TextField label="Заголовок hero" value={s.heroTitle} onChange={(v) => set("heroTitle", v)} />
        <TextareaField label="Подзаголовок hero" value={s.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} rows={2} />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">Контакты</h2>
        <TextField label="Email" value={s.email} onChange={(v) => set("email", v)} />
        <TextField label="Telegram (ссылка)" value={s.telegram} onChange={(v) => set("telegram", v)} placeholder="https://t.me/username" />
        <TextField label="GitHub (ссылка)" value={s.github} onChange={(v) => set("github", v)} placeholder="https://github.com/username" />
        <TextareaField label="Текст на странице контактов" value={s.contactText} onChange={(v) => set("contactText", v)} rows={3} />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-faint">Аналитика</h2>
        <TextareaField
          label="Сниппет аналитики"
          value={s.analyticsSnippet}
          onChange={(v) => set("analyticsSnippet", v)}
          rows={6}
          hint="Код Яндекс.Метрики / Plausible. Вставляется в страницы как есть."
        />
      </Card>

      <button onClick={save} disabled={pending} className={buttonClass("primary")}>
        {pending ? "Сохранение…" : "Сохранить настройки"}
      </button>
    </div>
  );
}
