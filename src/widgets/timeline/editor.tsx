"use client";

import type { TimelineData } from "./def";
import { TextField, TextareaField, Repeater } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

type Item = TimelineData["items"][number];

export function TimelineEditor({ data, onChange }: WidgetEditorProps<TimelineData>) {
  return (
    <Repeater<Item>
      label="Этапы"
      addLabel="Добавить этап"
      items={data.items}
      onChange={(items) => onChange({ ...data, items })}
      newItem={() => ({ date: "", title: "", description: "" })}
      renderItem={(item, update) => (
        <div className="space-y-2">
          <TextField label="Дата / период" value={item.date} onChange={(date) => update({ ...item, date })} placeholder="напр. Q1 2025" />
          <TextField label="Заголовок" value={item.title} onChange={(title) => update({ ...item, title })} />
          <TextareaField label="Описание" value={item.description} onChange={(description) => update({ ...item, description })} rows={3} />
        </div>
      )}
    />
  );
}
