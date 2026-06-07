"use client";

import type { SpacerData } from "./def";
import { SelectField, SwitchField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function SpacerEditor({ data, onChange }: WidgetEditorProps<SpacerData>) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Размер отступа"
        value={data.size}
        onChange={(size) => onChange({ ...data, size })}
        options={[
          { value: "sm", label: "Маленький" },
          { value: "md", label: "Средний" },
          { value: "lg", label: "Большой" },
        ]}
      />
      <SwitchField label="Показать линию-разделитель" value={data.divider} onChange={(divider) => onChange({ ...data, divider })} />
    </div>
  );
}
