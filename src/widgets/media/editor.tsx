"use client";

import { useRef, useState } from "react";
import type { MediaData } from "./def";
import { SelectField, TextField, Field } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function MediaEditor({ data, onChange }: WidgetEditorProps<MediaData>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      onChange({ ...data, url: json.url, mimeType: json.mimeType });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <SelectField
        label="Источник"
        value={data.kind}
        onChange={(kind) => onChange({ ...data, kind })}
        options={[
          { value: "upload", label: "Загруженный файл (видео/GIF)" },
          { value: "embed", label: "Встраивание (YouTube/Vimeo)" },
        ]}
      />

      {data.kind === "upload" ? (
        <Field label="Файл" hint="MP4/WebM/GIF">
          <div className="space-y-2">
            {data.url ? <p className="truncate text-xs text-fg-muted">{data.url}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy ? "Загрузка…" : data.url ? "Заменить файл" : "Загрузить файл"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </div>
        </Field>
      ) : (
        <TextField
          label="Ссылка на видео"
          value={data.embedUrl}
          onChange={(embedUrl) => onChange({ ...data, embedUrl })}
          placeholder="https://youtu.be/..."
        />
      )}

      <TextField label="Подпись" value={data.caption} onChange={(caption) => onChange({ ...data, caption })} />
    </div>
  );
}
