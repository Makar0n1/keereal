"use client";

import type { MetricsData } from "./def";
import { TextField, Repeater } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

type Item = MetricsData["items"][number];

export function MetricsEditor({ data, onChange }: WidgetEditorProps<MetricsData>) {
  return (
    <Repeater<Item>
      label="Показатели (2–4)"
      addLabel="Добавить показатель"
      items={data.items}
      onChange={(items) => onChange({ ...data, items })}
      newItem={() => ({ value: "", label: "" })}
      renderItem={(item, update) => (
        <div className="space-y-2">
          <TextField label="Значение" value={item.value} onChange={(value) => update({ ...item, value })} placeholder="напр. +47%" />
          <TextField label="Подпись" value={item.label} onChange={(label) => update({ ...item, label })} placeholder="напр. конверсия" />
        </div>
      )}
    />
  );
}
