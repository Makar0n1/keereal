import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card, StatusBadge, EmptyState } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projectCount, publishedCount, newLeads, totalLeads, recentLeads] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <PageHeader title="Обзор" description="Состояние сайта и последние заявки" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Проектов" value={projectCount} href="/admin/projects" />
        <StatCard label="Опубликовано" value={publishedCount} href="/admin/projects" />
        <StatCard label="Новых заявок" value={newLeads} href="/admin/leads" />
        <StatCard label="Всего заявок" value={totalLeads} href="/admin/leads" />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Последние заявки</h2>
          <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
            Все заявки <ArrowRight size={14} />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <EmptyState title="Заявок пока нет" />
        ) : (
          <Card className="divide-y divide-bg-border p-0">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href="/admin/leads"
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-bg-card/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{lead.name}</p>
                  <p className="truncate text-sm text-fg-muted">{lead.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <span className="text-xs text-fg-faint">{formatDate(lead.createdAt)}</span>
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
