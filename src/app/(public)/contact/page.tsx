import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { ContactForm } from "@/components/public/ContactForm";
import { Reveal } from "@/components/public/Reveal";

export const dynamic = "force-dynamic"; // SSR; settings read at runtime, not build

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь со мной, чтобы обсудить проект.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-content px-5 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              Связаться
            </h1>
            <p className="mt-4 max-w-md text-lg text-fg-muted">
              {s.contactText ||
                "Опишите задачу — отвечу с оценкой сроков и предложением по реализации."}
            </p>
            <div className="mt-8 space-y-3 text-sm">
              {s.telegram ? (
                <a
                  href={s.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-fg-muted hover:text-fg"
                >
                  <span className="font-mono text-accent">Telegram</span>
                  <span>{s.telegram.replace(/^https?:\/\//, "")}</span>
                </a>
              ) : null}
              {s.email ? (
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-fg-muted hover:text-fg">
                  <span className="font-mono text-accent">Email</span>
                  <span>{s.email}</span>
                </a>
              ) : null}
              {s.github ? (
                <a
                  href={s.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-fg-muted hover:text-fg"
                >
                  <span className="font-mono text-accent">GitHub</span>
                  <span>{s.github.replace(/^https?:\/\//, "")}</span>
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-2xl border border-bg-border bg-bg-card p-6 sm:p-8">
            <ContactForm source="/contact" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
