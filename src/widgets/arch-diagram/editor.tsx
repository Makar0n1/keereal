"use client";

import type { ArchDiagramData } from "./def";
import { ImageField, TextField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function ArchDiagramEditor({ data, onChange }: WidgetEditorProps<ArchDiagramData>) {
  return (
    <div className="space-y-4">
      <ImageField label="Схема" value={data.image} onChange={(image) => onChange({ ...data, image })} />
      <TextField label="Подпись" value={data.caption} onChange={(caption) => onChange({ ...data, caption })} />
    </div>
  );
}
