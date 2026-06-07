"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Builder } from "./builder/Builder";
import { type EditorBlock, newKey } from "./builder/types";
import {
  TextField,
  TextareaField,
  NumberField,
  SelectField,
  SwitchField,
  TagsField,
  ImageField,
} from "./fields";
import { buttonClass, StatusBadge } from "./ui";
import { cn, slugify } from "@/lib/utils";
import type { ImageValue } from "@/widgets/shared";
import { updateProjectMeta, saveBlocks, deleteProject } from "@/app/admin/(panel)/projects/actions";

export interface ProjectEditorData {
  id: string;
  pageId: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  year: number | null;
  status: "DRAFT" | "PUBLISHED";
  isFeatured: boolean;
  sort: number;
  seoTitle: string | null;
  seoDescription: string | null;
  cover: ImageValue | null;
  ogImage: ImageValue | null;
  blocks: { id: string; type: string; isVisible: boolean; data: unknown }[];
}

type Tab = "content" | "settings";

export function ProjectEditorShell({ project }: { project: ProjectEditorData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("content");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [meta, setMeta] = useState({
    title: project.title,
    slug: project.slug,
    excerpt: project.excerpt,
    tags: project.tags,
    year: project.year ?? undefined,
    status: project.status,
    isFeatured: project.isFeatured,
    sort: project.sort,
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
  });
  const [cover, setCover] = useState<ImageValue | undefined>(project.cover ?? undefined);
  const [ogImage, setOgImage] = useState<ImageValue | undefined>(project.ogImage ?? undefined);

  const [blocks, setBlocks] = useState<EditorBlock[]>(
    project.blocks.map((b) => ({ key: newKey(), id: b.id, type: b.type, isVisible: b.isVisible, data: b.data }))
  );

  function save() {
    setMessage(null);
    startTransition(async () => {
      const metaRes = await updateProjectMeta(project.id, {
        title: meta.title,
        slug: meta.slug,
        excerpt: meta.excerpt,
        coverId: cover?.mediaId ?? null,
        tags: meta.tags,
        year: meta.year ?? null,
        status: meta.status,
        isFeatured: meta.isFeatured,
        sort: meta.sort,
        seoTitle: meta.seoTitle || null,
        seoDescription: meta.seoDescription || null,
        ogImageId: ogImage?.mediaId ?? null,
      });
      if (!metaRes.ok) {
        setMessage({ type: "err", text: metaRes.error });
        return;
      }

      const blocksRes = await saveBlocks({
        pageId: project.pageId,
        blocks: blocks.map((b) => ({ id: b.id, type: b.type, isVisible: b.isVisible, data: b.data })),
      });
      if (!blocksRes.ok) {
        setMessage({ type: "err", text: blocksRes.error });
        return;
      }
      // Re-key blocks with canonical DB ids.
      setBlocks(
        blocksRes.blocks.map((b) => ({
          key: newKey(),
          id: b.id,
          type: b.type,
          isVisible: b.isVisible,
          data: b.data,
        }))
      );
      if (metaRes.slug !== meta.slug) {
        setMeta((m) => ({ ...m, slug: metaRes.slug }));
      }
      setMessage({ type: "ok", text: "Сохранено" });
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm("Удалить проект? Действие необратимо.")) return;
    startTransition(() => {
      deleteProject(project.id);
    });
  }

  return (
    <div className="pb-24">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-fg">{meta.title || "Без названия"}</h1>
          <StatusBadge status={meta.status} />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/preview?redirect=${encodeURIComponent(`/projects/${meta.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary")}
          >
            Предпросмотр
          </a>
          <button onClick={save} disabled={pending} className={buttonClass("primary")}>
            {pending ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={cn(
            "mb-4 rounded-md px-3 py-2 text-sm",
            message.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}
        >
          {message.text}
        </div>
      ) : null}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-bg-border">
        {[
          { id: "content" as const, label: "Содержание" },
          { id: "settings" as const, label: "Настройки кейса" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition",
              tab === t.id ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <Builder blocks={blocks} setBlocks={setBlocks} />
      ) : (
        <div className="max-w-2xl space-y-5">
          <TextField label="Название" value={meta.title} onChange={(title) => setMeta({ ...meta, title })} />
          <TextField
            label="Slug (URL)"
            value={meta.slug}
            onChange={(slug) => setMeta({ ...meta, slug: slugify(slug) })}
            hint={`Адрес: /projects/${meta.slug || "…"}`}
          />
          <TextareaField
            label="Краткое описание (для карточек)"
            value={meta.excerpt}
            onChange={(excerpt) => setMeta({ ...meta, excerpt })}
            rows={3}
          />
          <ImageField label="Обложка" value={cover} onChange={setCover} />
          <TagsField label="Теги" value={meta.tags} onChange={(tags) => setMeta({ ...meta, tags })} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Год" value={meta.year} onChange={(year) => setMeta({ ...meta, year })} placeholder="2025" />
            <NumberField label="Порядок" value={meta.sort} onChange={(sort) => setMeta({ ...meta, sort: sort ?? 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Статус"
              value={meta.status}
              onChange={(status) => setMeta({ ...meta, status })}
              options={[
                { value: "DRAFT", label: "Черновик" },
                { value: "PUBLISHED", label: "Опубликован" },
              ]}
            />
            <div className="flex items-end pb-2">
              <SwitchField
                label="В избранном"
                value={meta.isFeatured}
                onChange={(isFeatured) => setMeta({ ...meta, isFeatured })}
              />
            </div>
          </div>

          <div className="border-t border-bg-border pt-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-faint">SEO</h3>
            <div className="space-y-4">
              <TextField label="SEO title" value={meta.seoTitle} onChange={(seoTitle) => setMeta({ ...meta, seoTitle })} hint="Если пусто — используется название" />
              <TextareaField label="SEO description" value={meta.seoDescription} onChange={(seoDescription) => setMeta({ ...meta, seoDescription })} rows={2} />
              <ImageField label="OG-изображение" value={ogImage} onChange={setOgImage} />
            </div>
          </div>

          <div className="border-t border-bg-border pt-5">
            <button onClick={onDelete} disabled={pending} className={buttonClass("danger")}>
              Удалить проект
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
