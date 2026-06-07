import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { LeadList, type LeadItem } from "@/components/admin/LeadList";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { visitor: { select: { thread: { select: { id: true } } } } },
  });
  const items: LeadItem[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    contact: l.contact,
    message: l.message,
    pageSource: l.pageSource,
    status: l.status,
    note: l.note,
    createdAt: l.createdAt.toISOString(),
    hasChat: Boolean(l.visitor?.thread),
  }));

  return (
    <div>
      <PageHeader title="Заявки" description="Сообщения с формы обратной связи" />
      <LeadList leads={items} />
    </div>
  );
}
