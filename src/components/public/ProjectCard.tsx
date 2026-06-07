import Link from "next/link";
import Image from "next/image";
import type { ProjectCard as ProjectCardData } from "@/lib/data";
import { Reveal } from "./Reveal";

export function ProjectCard({ project, index = 0 }: { project: ProjectCardData; index?: number }) {
  return (
    <Reveal delay={index * 70} className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-bg-border bg-bg-card transition hover:border-accent/50"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
          {project.cover?.url ? (
            <Image
              src={project.cover.url}
              alt={project.cover.alt || project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-fg-faint">
              <span className="font-mono text-sm">{project.title}</span>
            </div>
          )}
        </div>
        {/* Reserved heights keep title/description/tags aligned across cards;
            content sticks to the top of each zone. */}
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="flex min-h-[3rem] items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-semibold text-fg group-hover:text-accent">
              {project.title}
            </h3>
            {project.year ? (
              <span className="shrink-0 font-mono text-xs text-fg-faint">{project.year}</span>
            ) : null}
          </div>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-fg-muted">{project.excerpt}</p>
          <div className="flex min-h-[1.75rem] flex-wrap content-center items-center gap-1.5">
            {project.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-bg-border px-2 py-0.5 text-xs leading-none text-fg-faint"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
