"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getWidget, getDefaultData } from "@/widgets/registry";
import { BlockEditor } from "@/widgets/editor-registry";
import { cn } from "@/lib/utils";
import { Catalog } from "./Catalog";
import { WidgetIcon } from "./widget-icons";
import { type EditorBlock, newKey } from "./types";
import { GripVertical, Eye, EyeOff, Copy, Trash2, Pencil, Plus, X } from "lucide-react";

function SortableRow({
  block,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  block: EditorBlock;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.key,
  });
  const widget = getWidget(block.type);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-bg-border bg-bg-card p-3",
        isDragging && "opacity-60 ring-1 ring-accent",
        !block.isVisible && "opacity-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-fg-faint hover:text-fg active:cursor-grabbing"
        aria-label="Перетащить"
      >
        <GripVertical size={18} />
      </button>
      <WidgetIcon type={block.type} className="h-5 w-5 shrink-0 text-fg-muted" />
      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-fg">
          {widget?.name ?? block.type}
        </span>
        <span className="block truncate text-xs text-fg-faint">{summarize(block)}</span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={onToggle} title={block.isVisible ? "Скрыть" : "Показать"} className="rounded p-1.5 text-fg-muted hover:text-fg">
          {block.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={onDuplicate} title="Дублировать" className="rounded p-1.5 text-fg-muted hover:text-fg">
          <Copy size={16} />
        </button>
        <button onClick={onEdit} title="Изменить" className="rounded p-1.5 text-fg-muted hover:text-fg">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} title="Удалить" className="rounded p-1.5 text-red-400 hover:text-red-300">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// Short human summary of a block for the row caption.
function summarize(block: EditorBlock): string {
  const d = block.data as Record<string, unknown>;
  if (!d) return "";
  const firstString = ["title", "text", "markdown", "problemTitle", "caption"]
    .map((k) => d[k])
    .find((v) => typeof v === "string" && v.trim()) as string | undefined;
  return firstString ? firstString.slice(0, 60) : "—";
}

export function Builder({
  blocks,
  setBlocks,
}: {
  blocks: EditorBlock[];
  setBlocks: (next: EditorBlock[]) => void;
}) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const editing = blocks.find((b) => b.key === editingKey) ?? null;

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.key === active.id);
    const to = blocks.findIndex((b) => b.key === over.id);
    if (from < 0 || to < 0) return;
    setBlocks(arrayMove(blocks, from, to));
  }

  function addBlock(type: string) {
    const block: EditorBlock = {
      key: newKey(),
      type,
      isVisible: true,
      data: structuredClone(getDefaultData(type)),
    };
    setBlocks([...blocks, block]);
    setCatalogOpen(false);
    setEditingKey(block.key);
  }

  function updateData(key: string, data: unknown) {
    setBlocks(blocks.map((b) => (b.key === key ? { ...b, data } : b)));
  }

  function duplicate(key: string) {
    const idx = blocks.findIndex((b) => b.key === key);
    if (idx < 0) return;
    const src = blocks[idx]!;
    const copy: EditorBlock = {
      key: newKey(),
      type: src.type,
      isVisible: src.isVisible,
      data: structuredClone(src.data),
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bg-border py-12 text-center text-fg-faint">
          Блоков пока нет. Добавьте первый блок.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b.key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((b) => (
                <SortableRow
                  key={b.key}
                  block={b}
                  onEdit={() => setEditingKey(b.key)}
                  onDuplicate={() => duplicate(b.key)}
                  onToggle={() =>
                    setBlocks(blocks.map((x) => (x.key === b.key ? { ...x, isVisible: !x.isVisible } : x)))
                  }
                  onDelete={() => {
                    setBlocks(blocks.filter((x) => x.key !== b.key));
                    if (editingKey === b.key) setEditingKey(null);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        onClick={() => setCatalogOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-bg-border py-3 text-sm font-medium text-fg-muted transition hover:border-accent hover:text-fg"
      >
        <Plus size={16} /> Добавить блок
      </button>

      {catalogOpen ? <Catalog onPick={addBlock} onClose={() => setCatalogOpen(false)} /> : null}

      {/* Slide-over editor */}
      {editing ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/50" onClick={() => setEditingKey(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-bg-border bg-bg-soft p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-fg">
                  {getWidget(editing.type)?.name ?? editing.type}
                </h3>
                <p className="text-xs text-fg-faint">{getWidget(editing.type)?.description}</p>
              </div>
              <button onClick={() => setEditingKey(null)} aria-label="Закрыть" className="p-1 text-fg-faint hover:text-fg">
                <X size={18} />
              </button>
            </div>
            <BlockEditor
              type={editing.type}
              data={editing.data}
              onChange={(data) => updateData(editing.key, data)}
            />
            <button
              onClick={() => setEditingKey(null)}
              className="mt-6 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Готово
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
