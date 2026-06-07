"use client";

import type { TechStackData } from "./def";
import { TextField, TagsField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function TechStackEditor({ data, onChange }: WidgetEditorProps<TechStackData>) {
  return (
    <div className="space-y-4">
      <TextField label="Заголовок" value={data.title} onChange={(title) => onChange({ ...data, title })} />
      <TagsField label="Технологии" value={data.items} onChange={(items) => onChange({ ...data, items })} placeholder="напр. PostgreSQL" />
    </div>
  );
}
