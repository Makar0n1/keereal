"use client";

import type { GalleryData } from "./def";
import { ImageField, SelectField, Repeater } from "@/components/admin/fields";
import { emptyImage, type ImageValue } from "../shared";
import type { WidgetEditorProps } from "../types";

export function GalleryEditor({ data, onChange }: WidgetEditorProps<GalleryData>) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Колонок"
        value={String(data.columns)}
        onChange={(v) => onChange({ ...data, columns: Number(v) })}
        options={[
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ]}
      />
      <Repeater<ImageValue>
        label="Изображения"
        addLabel="Добавить изображение"
        items={data.images}
        onChange={(images) => onChange({ ...data, images })}
        newItem={() => ({ ...emptyImage })}
        renderItem={(item, update) => (
          <ImageField label="Изображение" value={item} onChange={(v) => update(v ?? { ...emptyImage })} withCaption />
        )}
      />
    </div>
  );
}
