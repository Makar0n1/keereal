import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/data";
import { ProjectCard } from "@/components/public/ProjectCard";

export const dynamic = "force-dynamic"; // SSR; DB read at runtime, not build

export const metadata: Metadata = {
  title: "Проекты",
  description: "Избранные кейсы и реализованные проекты.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto max-w-content px-5 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Проекты</h1>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Кейсы с описанием задач, решений и результатов.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bg-border py-20 text-center text-fg-faint">
          Пока нет опубликованных проектов.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
