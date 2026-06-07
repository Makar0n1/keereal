import Link from "next/link";
import { getSettings, getFeaturedProjects } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Reveal } from "@/components/public/Reveal";
import { JsonLd } from "@/components/public/JsonLd";

export const revalidate = 300; // ISR

const SERVICES = [
  {
    title: "Веб-приложения",
    text: "Полноценные продукты на Next.js / Node: от прототипа до production с CI/CD.",
  },
  {
    title: "Backend и API",
    text: "Проектирование БД, REST/GraphQL, интеграции платежей и внешних сервисов.",
  },
  {
    title: "Архитектура и аудит",
    text: "Ревью кодовой базы, оптимизация производительности, масштабирование.",
  },
];

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedProjects()]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.siteName,
    jobTitle: settings.role,
    url: siteUrl,
    sameAs: [settings.github, settings.telegram].filter(Boolean),
    email: settings.email || undefined,
  };

  return (
    <>
      <JsonLd data={personJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-content px-5 pb-12 pt-20 sm:pt-32">
          <Reveal>
            <p className="font-mono text-sm text-accent">{settings.role}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl">
              {settings.heroTitle}
            </h1>
            {settings.heroSubtitle ? (
              <p className="mt-6 max-w-2xl text-lg text-fg-muted sm:text-xl">
                {settings.heroSubtitle}
              </p>
            ) : null}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
              >
                Обсудить проект
              </Link>
              <Link
                href="/projects"
                className="rounded-lg border border-bg-border px-6 py-3 font-medium text-fg transition hover:border-accent/50"
              >
                Смотреть работы
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured cases */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-content px-5 py-12">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Избранные кейсы
            </h2>
            <Link href="/projects" className="text-sm text-fg-muted hover:text-fg">
              Все проекты →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* What I do */}
      <section className="mx-auto max-w-content px-5 py-12">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Что я делаю
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="h-full rounded-xl border border-bg-border bg-bg-card p-6">
                <h3 className="text-lg font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm text-fg-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-content px-5 py-16">
        <Reveal>
          <div className="rounded-2xl border border-bg-border bg-gradient-to-b from-accent/10 to-bg-card p-10 text-center sm:p-16">
            <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Есть задача? Давайте обсудим.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-fg-muted">
              Опишите проект — отвечу с оценкой сроков и подходом к реализации.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-lg bg-accent px-7 py-3 font-medium text-white transition hover:bg-accent/90"
            >
              Связаться
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
