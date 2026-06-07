"use client";

import type { TextData } from "./def";
import { TextareaField, SelectField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function TextEditor({ data, onChange }: WidgetEditorProps<TextData>) {
  return (
    <div className="space-y-4">
      <TextareaField
        label="Текст (Markdown)"
        rows={10}
        value={data.markdown}
        onChange={(markdown) => onChange({ ...data, markdown })}
        hint="Поддерживается **жирный**, ## заголовки, списки, ссылки, код."
      />
      <SelectField
        label="Ширина"
        value={data.width}
        onChange={(width) => onChange({ ...data, width })}
        options={[
          { value: "narrow", label: "Узкая" },
          { value: "normal", label: "Обычная" },
          { value: "wide", label: "Широкая" },
          { value: "full", label: "На всю ширину" },
        ]}
      />
    </div>
  );
}
