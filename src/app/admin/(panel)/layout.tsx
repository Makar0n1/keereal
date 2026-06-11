import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminChatProvider } from "@/components/admin/AdminChatProvider";
import { PushSetup } from "@/components/admin/PushSetup";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const newLeads = await prisma.lead.count({ where: { status: "NEW" } });

  return (
    <AdminChatProvider>
      <div id="admin-shell" className="min-h-screen bg-bg text-fg">
        {/* Mobile top bar */}
        <AdminMobileNav email={user.email} newLeads={newLeads} />

        <div className="mx-auto flex max-w-[1400px] gap-6 px-3 py-4 sm:px-4 sm:py-6">
          {/* Desktop sidebar */}
          <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-56 shrink-0 flex-col rounded-xl border border-bg-border bg-bg-soft p-4 lg:flex">
            <div className="mb-6">
              <p className="font-mono text-sm font-semibold">Управление</p>
              <p className="mt-0.5 truncate text-xs text-fg-faint">{user.email}</p>
            </div>
            <AdminNav newLeads={newLeads} />
            <div className="mt-auto pt-4">
              <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-xs text-fg-faint hover:text-fg">
                <ExternalLink size={13} /> Открыть сайт
              </Link>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <PushSetup />
            {children}
          </div>
        </div>
      </div>
    </AdminChatProvider>
  );
}
