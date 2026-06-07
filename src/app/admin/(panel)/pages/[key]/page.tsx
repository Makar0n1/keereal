import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageEditorShell } from "@/components/admin/PageEditorShell";

export const dynamic = "force-dynamic";

const PAGES: Record<string, { title: string; path: string }> = {
  about: { title: "Обо мне", path: "/about" },
};

export default async function EditStandalonePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const meta = PAGES[key];
  if (!meta) notFound();

  // Create the page row on first edit.
  let page = await prisma.page.findUnique({
    where: { key },
    include: { blocks: { orderBy: { sort: "asc" } } },
  });
  if (!page) {
    page = await prisma.page.create({
      data: { key, status: "PUBLISHED" },
      include: { blocks: { orderBy: { sort: "asc" } } },
    });
  }

  return (
    <div>
      <Link href="/admin/pages" className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={14} /> К списку страниц
      </Link>
      <PageEditorShell
        pageId={page.id}
        title={meta.title}
        previewPath={meta.path}
        initialStatus={page.status}
        initialBlocks={page.blocks.map((b) => ({
          id: b.id,
          type: b.type,
          isVisible: b.isVisible,
          data: b.data,
        }))}
      />
    </div>
  );
}
