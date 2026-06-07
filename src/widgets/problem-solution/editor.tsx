"use client";

import type { ProblemSolutionData } from "./def";
import { TextField, TextareaField } from "@/components/admin/fields";
import type { WidgetEditorProps } from "../types";

export function ProblemSolutionEditor({ data, onChange }: WidgetEditorProps<ProblemSolutionData>) {
  return (
    <div className="space-y-4">
      <TextField label="Заголовок «Проблема»" value={data.problemTitle} onChange={(problemTitle) => onChange({ ...data, problemTitle })} />
      <TextareaField label="Текст проблемы" value={data.problem} onChange={(problem) => onChange({ ...data, problem })} rows={5} />
      <TextField label="Заголовок «Решение»" value={data.solutionTitle} onChange={(solutionTitle) => onChange({ ...data, solutionTitle })} />
      <TextareaField label="Текст решения" value={data.solution} onChange={(solution) => onChange({ ...data, solution })} rows={5} />
    </div>
  );
}
