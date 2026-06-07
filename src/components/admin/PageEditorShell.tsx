"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Builder } from "./builder/Builder";
import { type EditorBlock, newKey } from "./builder/types";
import { SelectField } from "./fields";
import { buttonClass, StatusBadge } from "./ui";
import { cn } from "@/lib/utils";
import { saveBlocks } from "@/app/admin/(panel)/projects/actions";
import { updatePageStatus } from "@/app/admin/(panel)/pages/actions";

export function PageEditorShell({
  pageId,
  title,
  previewPath,
  initialStatus,
  initialBlocks,
}: {
  pageId: string;
  title: string;
  previewPath: string;
  initialStatus: "DRAFT" | "PUBLISHED";
  initialBlocks: { id: string; type: string; isVisible: boolean; data: unknown }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    initialBlocks.map((b) => ({ key: newKey(), id: b.id, type: b.type, isVisible: b.isVisible, data: b.data }))
  );

  function save() {
    setMessage(null);
    startTransition(async () => {
      await updatePageStatus(pageId, status);
      const res = await saveBlocks({
        pageId,
        blocks: blocks.map((b) => ({ id: b.id, type: b.type, isVisible: b.isVisible, data: b.data })),
      });
      if (!res.ok) {
        setMessage({ type: "err", text: res.error });
        return;
      }
      setBlocks(
        res.blocks.map((b) => ({ key: newKey(), id: b.id, type: b.type, isVisible: b.isVisible, data: b.data }))
      );
      setMessage({ type: "ok", text: "Сохранено" });
      router.refresh();
    });
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/preview?redirect=${encodeURIComponent(previewPath)}`}
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

      <div className="mb-5 max-w-xs">
        <SelectField
          label="Статус"
          value={status}
          onChange={setStatus}
          options={[
            { value: "DRAFT", label: "Черновик" },
            { value: "PUBLISHED", label: "Опубликован" },
          ]}
        />
      </div>

      <Builder blocks={blocks} setBlocks={setBlocks} />
    </div>
  );
}
