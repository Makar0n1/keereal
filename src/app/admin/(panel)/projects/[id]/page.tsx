import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectEditorShell, type ProjectEditorData } from "@/components/admin/ProjectEditorShell";
import type { ImageValue } from "@/widgets/shared";

export const dynamic = "force-dynamic";

function toImageValue(media: {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
} | null): ImageValue | null {
  if (!media) return null;
  return {
    mediaId: media.id,
    url: media.url,
    alt: media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  };
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      cover: true,
      ogImage: true,
      page: { include: { blocks: { orderBy: { sort: "asc" } } } },
    },
  });
  if (!project) notFound();

  const data: ProjectEditorData = {
    id: project.id,
    pageId: project.pageId,
    title: project.title,
    slug: project.slug,
    excerpt: project.excerpt,
    tags: project.tags,
    year: project.year,
    status: project.status,
    isFeatured: project.isFeatured,
    sort: project.sort,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    cover: toImageValue(project.cover),
    ogImage: toImageValue(project.ogImage),
    blocks: project.page.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      isVisible: b.isVisible,
      data: b.data,
    })),
  };

  return (
    <div>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={14} /> К списку проектов
      </Link>
      <ProjectEditorShell project={data} />
    </div>
  );
}
