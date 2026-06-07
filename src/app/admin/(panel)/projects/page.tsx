import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, EmptyState, StatusBadge, buttonClass } from "@/components/admin/ui";
import { createProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Проекты"
        description="Кейсы портфолио"
        action={
          <form action={createProject}>
            <input type="hidden" name="title" value="Новый проект" />
            <button type="submit" className={buttonClass("primary")}>
              + Новый проект
            </button>
          </form>
        }
      />

      {projects.length === 0 ? (
        <EmptyState title="Пока нет проектов" hint="Создайте первый кейс кнопкой выше." />
      ) : (
        <Card className="divide-y divide-bg-border p-0">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="block truncate font-medium text-fg hover:text-accent"
                >
                  {p.title}
                </Link>
                <p className="truncate font-mono text-xs text-fg-faint">/{p.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {p.isFeatured ? (
                  <Star size={16} className="fill-accent text-accent" aria-label="В избранном" />
                ) : null}
                <StatusBadge status={p.status} />
                <Link
                  href={`/admin/projects/${p.id}`}
                  aria-label="Открыть"
                  className="p-1.5 text-fg-muted transition hover:text-fg"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
