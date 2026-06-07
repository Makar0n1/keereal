import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getProjectBySlug, toRenderableBlocks } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import { BlockList } from "@/widgets/render-registry";
import { JsonLd } from "@/components/public/JsonLd";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const project = await getProjectBySlug(slug, { preview: isEnabled });
  if (!project) return { title: "Не найдено" };

  const title = project.seoTitle || project.title;
  const description = project.seoDescription || project.excerpt;
  // Use uploaded OG image, else fall back to dynamic /og generator.
  const ogImage = project.ogImage?.url || `/og?slug=${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteUrl}/projects/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const project = await getProjectBySlug(slug, { preview: isEnabled });
  if (!project) notFound();

  const blocks = toRenderableBlocks(project.page.blocks);

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.excerpt,
    url: `${siteUrl}/projects/${slug}`,
    dateCreated: project.year ? `${project.year}` : undefined,
    keywords: project.tags.join(", "),
    image: project.cover?.url ? `${siteUrl}${project.cover.url}` : undefined,
  };

  return (
    <article className="pb-10">
      <JsonLd data={creativeWorkJsonLd} />

      {isEnabled ? (
        <div className="sticky top-16 z-40 bg-yellow-500/90 px-5 py-2 text-center text-sm font-medium text-black">
          Режим предпросмотра черновика ·{" "}
          <a href="/api/admin/preview/exit" className="underline">
            Выйти
          </a>
        </div>
      ) : null}

      <BlockList blocks={blocks} />

      {blocks.length === 0 ? (
        <div className="mx-auto max-w-content px-5 py-24 text-center text-fg-faint">
          В этом кейсе пока нет блоков.
        </div>
      ) : null}

      <div className="mx-auto max-w-content px-5 pt-8">
        <Link href="/projects" className="text-sm text-fg-muted hover:text-fg">
          ← Все проекты
        </Link>
      </div>
    </article>
  );
}
