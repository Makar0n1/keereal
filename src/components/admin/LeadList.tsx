"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, buttonClass } from "./ui";
import { cn, formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { updateLead, deleteLead } from "@/app/admin/(panel)/leads/actions";

export interface LeadItem {
  id: string;
  name: string;
  contact: string;
  message: string;
  pageSource: string | null;
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  note: string | null;
  createdAt: string;
  hasChat?: boolean;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "CLOSED", label: "Закрыта" },
] as const;

function LeadRow({ lead }: { lead: LeadItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(lead.note ?? "");
  const [status, setStatus] = useState(lead.status);

  function changeStatus(next: LeadItem["status"]) {
    setStatus(next);
    startTransition(async () => {
      await updateLead({ id: lead.id, status: next });
      router.refresh();
    });
  }

  function saveNote() {
    startTransition(async () => {
      await updateLead({ id: lead.id, note });
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Удалить заявку?")) return;
    startTransition(async () => {
      await deleteLead(lead.id);
      router.refresh();
    });
  }

  return (
    <div className={cn("p-4", status === "NEW" && "bg-accent/[0.03]")}>
      <div className="flex items-start justify-between gap-4">
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-fg">{lead.name}</span>
            <StatusBadge status={status} />
            {lead.hasChat ? (
              <a
                href="/admin/chat"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/25"
                title="Этот человек писал в чат"
              >
                <MessageSquare size={11} /> чат
              </a>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-accent">{lead.contact}</p>
          <p className={cn("mt-1 text-sm text-fg-muted", !open && "line-clamp-1")}>{lead.message}</p>
        </button>
        <span className="shrink-0 text-xs text-fg-faint">{formatDate(lead.createdAt)}</span>
      </div>

      {open ? (
        <div className="mt-4 space-y-3 border-t border-bg-border pt-4">
          {lead.pageSource ? (
            <p className="text-xs text-fg-faint">Источник: {lead.pageSource}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-fg-muted">Статус:</span>
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                disabled={pending}
                onClick={() => changeStatus(o.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs transition",
                  status === o.value
                    ? "bg-accent text-white"
                    : "border border-bg-border text-fg-muted hover:text-fg"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Заметка к заявке…"
              className="w-full rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={saveNote} disabled={pending} className={buttonClass("secondary", "px-3 py-1.5")}>
                Сохранить заметку
              </button>
              <button onClick={remove} disabled={pending} className={buttonClass("danger", "px-3 py-1.5")}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LeadList({ leads }: { leads: LeadItem[] }) {
  const [filter, setFilter] = useState<"ALL" | LeadItem["status"]>("ALL");
  const visible = filter === "ALL" ? leads : leads.filter((l) => l.status === filter);

  const counts = {
    ALL: leads.length,
    NEW: leads.filter((l) => l.status === "NEW").length,
    IN_PROGRESS: leads.filter((l) => l.status === "IN_PROGRESS").length,
    CLOSED: leads.filter((l) => l.status === "CLOSED").length,
  };

  const filters = [
    { value: "ALL" as const, label: "Все" },
    { value: "NEW" as const, label: "Новые" },
    { value: "IN_PROGRESS" as const, label: "В работе" },
    { value: "CLOSED" as const, label: "Закрытые" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = counts[f.value];
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
                active ? "bg-bg-card text-fg" : "text-fg-muted hover:text-fg"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-medium leading-none",
                  f.value === "NEW" && count > 0
                    ? "bg-accent/20 text-accent"
                    : active
                      ? "bg-bg-border text-fg"
                      : "bg-bg-card text-fg-faint"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bg-border py-16 text-center text-fg-faint">
          Заявок нет
        </div>
      ) : (
        <div className="divide-y divide-bg-border rounded-xl border border-bg-border bg-bg-soft">
          {visible.map((l) => (
            <LeadRow key={l.id} lead={l} />
          ))}
        </div>
      )}
    </div>
  );
}
