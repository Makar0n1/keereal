"use client";

import type { HeroCaseData } from "./def";
import { TextField, TextareaField, ImageField, TagsField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function HeroCaseEditor({ data, onChange }: WidgetEditorProps<HeroCaseData>) {
  return (
    <div className="space-y-4">
      <TextField
        label="Название кейса"
        value={data.title}
        onChange={(title) => onChange({ ...data, title })}
        placeholder="Например: Платёжная платформа для маркетплейса"
      />
      <TextareaField
        label="Суть (одна строка)"
        rows={2}
        value={data.subtitle}
        onChange={(subtitle) => onChange({ ...data, subtitle })}
      />
      <ImageField
        label="Обложка"
        value={data.cover}
        onChange={(cover) => onChange({ ...data, cover })}
      />
      <TagsField
        label="Теги"
        value={data.tags}
        onChange={(tags) => onChange({ ...data, tags })}
      />
    </div>
  );
}
