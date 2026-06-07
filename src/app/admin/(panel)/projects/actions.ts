"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  projectMetaSchema,
  saveBlocksSchema,
  type ProjectMetaInput,
} from "@/lib/validation";
import { parseBlockData, getDefaultData } from "@/widgets/registry";

// Ensure a slug is unique by suffixing -2, -3, … if needed.
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let candidate = root;
  let n = 1;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function createProject(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") || "").trim() || "Новый проект";
  const slug = await uniqueSlug(title);

  const project = await prisma.project.create({
    data: {
      title,
      slug,
      page: { create: { status: "DRAFT" } },
    },
  });

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProjectMeta(id: string, input: ProjectMetaInput) {
  await requireUser();
  const parsed = projectMetaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Ошибка валидации" };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.slug, id);

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      coverId: data.coverId ?? null,
      tags: data.tags,
      year: data.year ?? null,
      status: data.status,
      isFeatured: data.isFeatured,
      sort: data.sort,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ogImageId: data.ogImageId ?? null,
    },
  });
  // Keep the underlying builder page status in sync with the project.
  await prisma.page.update({ where: { id: project.pageId }, data: { status: data.status } });

  revalidatePath("/admin/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");
  return { ok: true as const, slug: project.slug };
}

export async function deleteProject(id: string) {
  await requireUser();
  // Cascades to the page + its blocks.
  await prisma.project.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

// Reconcile the full ordered block list for a page. Validates each block's data
// against its widget schema before persisting. Returns the canonical blocks.
export async function saveBlocks(input: unknown) {
  await requireUser();
  const parsed = saveBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Некорректные данные блоков" };
  }
  const { pageId, blocks } = parsed.data;

  // Validate/normalize each block's data via its widget schema.
  const normalized = blocks.map((b) => {
    const result = parseBlockData(b.type, b.data ?? getDefaultData(b.type));
    return {
      id: b.id,
      type: b.type,
      isVisible: b.isVisible,
      data: result.ok ? result.data : (getDefaultData(b.type) as object),
    };
  });

  const keepIds = normalized.map((b) => b.id).filter(Boolean) as string[];

  await prisma.$transaction(async (tx) => {
    // Delete blocks removed in the editor.
    await tx.block.deleteMany({
      where: { pageId, id: { notIn: keepIds.length ? keepIds : ["__none__"] } },
    });
    // Upsert each block with its new sort index.
    for (let i = 0; i < normalized.length; i++) {
      const b = normalized[i]!;
      if (b.id) {
        await tx.block.update({
          where: { id: b.id },
          data: { type: b.type, isVisible: b.isVisible, sort: i, data: b.data as object },
        });
      } else {
        await tx.block.create({
          data: { pageId, type: b.type, isVisible: b.isVisible, sort: i, data: b.data as object },
        });
      }
    }
  });

  const saved = await prisma.block.findMany({ where: { pageId }, orderBy: { sort: "asc" } });

  // Revalidate the public project page that owns this builder page.
  const project = await prisma.project.findUnique({ where: { pageId }, select: { slug: true } });
  if (project) revalidatePath(`/projects/${project.slug}`);
  const page = await prisma.page.findUnique({ where: { id: pageId }, select: { key: true } });
  if (page?.key) revalidatePath(`/${page.key}`);

  return {
    ok: true as const,
    blocks: saved.map((b) => ({
      id: b.id,
      type: b.type,
      isVisible: b.isVisible,
      data: b.data,
    })),
  };
}
