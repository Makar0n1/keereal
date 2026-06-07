"use client";

import { getCatalog } from "@/widgets/registry";
import type { WidgetCategory } from "@/widgets/types";
import { WidgetIcon } from "./widget-icons";
import { X } from "lucide-react";

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  content: "Контент",
  media: "Медиа",
  layout: "Разметка",
  conversion: "Конверсия",
};

// Modal grid of available widgets, grouped by category.
export function Catalog({
  onPick,
  onClose,
}: {
  onPick: (type: string) => void;
  onClose: () => void;
}) {
  const widgets = getCatalog();
  const categories = Array.from(new Set(widgets.map((w) => w.category)));

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl border border-bg-border bg-bg-soft p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Добавить блок</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-fg-faint hover:text-fg">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-faint">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {widgets
                  .filter((w) => w.category === cat)
                  .map((w) => (
                    <button
                      key={w.type}
                      onClick={() => onPick(w.type)}
                      className="flex flex-col items-start gap-1.5 rounded-lg border border-bg-border bg-bg-card p-3 text-left transition hover:border-accent/60"
                    >
                      <WidgetIcon type={w.type} className="h-5 w-5 text-accent" />
                      <span className="text-sm font-medium text-fg">{w.name}</span>
                      <span className="text-xs text-fg-faint">{w.description}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
