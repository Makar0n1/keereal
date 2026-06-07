import { prisma } from "./prisma";
import type { Block, Prisma } from "@prisma/client";
import type { RenderableBlock } from "@/widgets/render-registry";

// Centralized read access for public pages. All functions return plain data
// safe to pass into server components.

export async function getSettings() {
  const existing = await prisma.setting.findUnique({ where: { id: "global" } });
  if (existing) return existing;
  // Create the singleton with schema defaults on first run.
  return prisma.setting.create({ data: { id: "global" } });
}

export function toRenderableBlocks(blocks: Block[]): RenderableBlock[] {
  return blocks
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((b) => ({ id: b.id, type: b.type, data: b.data, isVisible: b.isVisible }));
}

const projectCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  tags: true,
  year: true,
  isFeatured: true,
  cover: { select: { url: true, alt: true, width: true, height: true } },
} satisfies Prisma.ProjectSelect;

export async function getFeaturedProjects(limit = 4) {
  return prisma.project.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: projectCardSelect,
  });
}

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    select: projectCardSelect,
  });
}

export type ProjectCard = Awaited<ReturnType<typeof getPublishedProjects>>[number];

// Fetch a project for the public page. When preview=false, only published
// projects resolve (drafts return null).
export async function getProjectBySlug(slug: string, opts: { preview?: boolean } = {}) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      cover: true,
      ogImage: true,
      page: { include: { blocks: { orderBy: { sort: "asc" } } } },
    },
  });
  if (!project) return null;
  if (!opts.preview && project.status !== "PUBLISHED") return null;
  return project;
}

// A standalone singleton page (e.g. "about"). Created on demand.
export async function getStandalonePage(key: string, opts: { preview?: boolean } = {}) {
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
  if (!opts.preview && page.status !== "PUBLISHED") return null;
  return page;
}
