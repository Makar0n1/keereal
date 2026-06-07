"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

// Reusable contact form. Anti-spam: honeypot field + minimum fill time
// (enforced server-side too) + server IP rate-limit. No captcha.
export function ContactForm({
  source,
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || ""),
      contact: String(fd.get("contact") || ""),
      message: String(fd.get("message") || ""),
      // honeypot — must stay empty
      website: String(fd.get("website") || ""),
      elapsedMs: Date.now() - mountedAt.current,
      pageSource: source || (typeof window !== "undefined" ? window.location.pathname : ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Не удалось отправить заявку");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="text-lg font-medium text-fg">Спасибо! Заявка отправлена.</p>
        <p className="mt-1 text-sm text-fg-muted">Я свяжусь с вами в ближайшее время.</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-bg-border bg-bg-soft px-4 py-3 text-fg outline-none transition focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-fg-faint";

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", compact && "space-y-2")} noValidate>
      {/* Honeypot — visually hidden, bots fill it */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Не заполняйте это поле
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input name="name" required placeholder="Ваше имя" className={inputCls} />
      <input
        name="contact"
        required
        placeholder="Telegram, телефон или email"
        className={inputCls}
      />
      <textarea
        name="message"
        required
        rows={compact ? 3 : 5}
        placeholder="Коротко о задаче"
        className={cn(inputCls, "resize-y")}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-accent px-5 py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
      >
        {status === "submitting" ? "Отправка…" : "Отправить заявку"}
      </button>
    </form>
  );
}
