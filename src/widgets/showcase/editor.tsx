"use client";

import type { ShowcaseData } from "./def";
import { ImageField, SelectField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function ShowcaseEditor({ data, onChange }: WidgetEditorProps<ShowcaseData>) {
  return (
    <div className="space-y-4">
      <ImageField label="Изображение" value={data.image} onChange={(image) => onChange({ ...data, image })} />
      <SelectField
        label="Рамка"
        value={data.frame}
        onChange={(frame) => onChange({ ...data, frame })}
        options={[
          { value: "browser", label: "Браузер" },
          { value: "phone", label: "Телефон" },
          { value: "none", label: "Без рамки" },
        ]}
      />
      <SelectField
        label="Градиент"
        value={data.gradient}
        onChange={(gradient) => onChange({ ...data, gradient })}
        options={[
          { value: "accent", label: "Акцентный" },
          { value: "violet", label: "Фиолетовый" },
          { value: "sunset", label: "Закат" },
          { value: "mono", label: "Монохром" },
        ]}
      />
    </div>
  );
}
