"use client";

import type { QuoteData } from "./def";
import { TextField, TextareaField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function QuoteEditor({ data, onChange }: WidgetEditorProps<QuoteData>) {
  return (
    <div className="space-y-4">
      <TextareaField label="Текст цитаты" value={data.text} onChange={(text) => onChange({ ...data, text })} rows={4} />
      <TextField label="Автор" value={data.author} onChange={(author) => onChange({ ...data, author })} />
      <TextField label="Роль / компания" value={data.role} onChange={(role) => onChange({ ...data, role })} />
    </div>
  );
}
