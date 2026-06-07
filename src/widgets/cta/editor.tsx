"use client";

import type { CtaData } from "./def";
import { TextField, TextareaField, SwitchField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function CtaEditor({ data, onChange }: WidgetEditorProps<CtaData>) {
  return (
    <div className="space-y-4">
      <TextField label="Заголовок" value={data.title} onChange={(title) => onChange({ ...data, title })} />
      <TextareaField label="Текст" value={data.text} onChange={(text) => onChange({ ...data, text })} rows={3} />
      <SwitchField
        label="Встроить форму связи"
        value={data.useContactForm}
        onChange={(useContactForm) => onChange({ ...data, useContactForm })}
      />
      {!data.useContactForm ? (
        <TextField label="Текст кнопки" value={data.buttonLabel} onChange={(buttonLabel) => onChange({ ...data, buttonLabel })} />
      ) : null}
    </div>
  );
}
