"use client";

import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ImageValue } from "@/widgets/shared";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-fg-faint">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm text-fg outline-none transition focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-fg-faint";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputBase}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={cn(inputBase, "resize-y font-mono text-[13px] leading-relaxed")}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        className={inputBase}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <select
        className={inputBase}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SwitchField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-sm font-medium text-fg">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          value ? "bg-accent" : "bg-bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
            value ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </label>
  );
}

export function TagsField({
  label,
  value,
  onChange,
  placeholder = "Введите и нажмите Enter",
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-bg-border bg-bg-soft p-2">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded bg-bg-card px-2 py-0.5 text-xs text-fg"
          >
            {t}
            <button
              type="button"
              className="text-fg-faint hover:text-fg"
              onClick={() => onChange(value.filter((x) => x !== t))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
        />
      </div>
    </Field>
  );
}

// Uploads to /api/admin/upload and returns an ImageValue. Used everywhere an
// image is needed; enforces alt text.
export function ImageField({
  label,
  value,
  onChange,
  withCaption = false,
}: {
  label: string;
  value: ImageValue | undefined;
  onChange: (v: ImageValue | undefined) => void;
  withCaption?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const img = value ?? { url: "", alt: "" };

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Не удалось загрузить");
      const json = await res.json();
      onChange({
        ...img,
        mediaId: json.id,
        url: json.url,
        width: json.width,
        height: json.height,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label}>
      <div className="space-y-2 rounded-md border border-bg-border bg-bg-soft p-3">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt}
            className="max-h-40 w-full rounded object-contain"
          />
        ) : (
          <div className="flex h-24 items-center justify-center rounded border border-dashed border-bg-border text-xs text-fg-faint">
            Нет изображения
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy ? "Загрузка…" : img.url ? "Заменить" : "Загрузить"}
          </button>
          {img.url ? (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded border border-bg-border px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            >
              Убрать
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        {img.url ? (
          <input
            className={cn(inputBase, "text-xs")}
            value={img.alt}
            placeholder="Alt-текст (обязательно для SEO)"
            onChange={(e) => onChange({ ...img, alt: e.target.value })}
          />
        ) : null}
        {withCaption && img.url ? (
          <input
            className={cn(inputBase, "text-xs")}
            value={img.caption ?? ""}
            placeholder="Подпись (необязательно)"
            onChange={(e) => onChange({ ...img, caption: e.target.value })}
          />
        ) : null}
      </div>
    </Field>
  );
}

// Generic repeater for arrays of sub-items (gallery images, metrics, timeline…).
export function Repeater<T>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
  addLabel = "Добавить",
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  addLabel?: string;
}) {
  const update = (i: number, next: T) =>
    onChange(items.map((it, idx) => (idx === i ? next : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    const a = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = a;
    onChange(copy);
  };
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-fg">{label}</span>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-bg-border bg-bg-soft p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-fg-faint">#{i + 1}</span>
              <div className="flex gap-1 text-xs">
                <button type="button" onClick={() => move(i, -1)} className="px-1 text-fg-muted hover:text-fg">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1 text-fg-muted hover:text-fg">↓</button>
                <button type="button" onClick={() => remove(i)} className="px-1 text-red-400 hover:text-red-300">Удалить</button>
              </div>
            </div>
            {renderItem(item, (next) => update(i, next), i)}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="w-full rounded-md border border-dashed border-bg-border py-2 text-sm text-fg-muted hover:border-accent hover:text-fg"
      >
        + {addLabel}
      </button>
    </div>
  );
}
