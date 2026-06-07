"use client";

import type { ComponentType } from "react";
import type { WidgetEditorProps } from "./types";

import { HeroCaseEditor } from "./hero-case/editor";
import { TextEditor } from "./text/editor";
import { ProblemSolutionEditor } from "./problem-solution/editor";
import { GalleryEditor } from "./gallery/editor";
import { ShowcaseEditor } from "./showcase/editor";
import { MetricsEditor } from "./metrics/editor";
import { TechStackEditor } from "./tech-stack/editor";
import { ArchDiagramEditor } from "./arch-diagram/editor";
import { MediaEditor } from "./media/editor";
import { QuoteEditor } from "./quote/editor";
import { TimelineEditor } from "./timeline/editor";
import { CtaEditor } from "./cta/editor";
import { SpacerEditor } from "./spacer/editor";

// Client-side editor forms, keyed by widget type. Used only inside the admin.
const EDITORS: Record<string, ComponentType<WidgetEditorProps<never>>> = {
  "hero-case": HeroCaseEditor,
  text: TextEditor,
  "problem-solution": ProblemSolutionEditor,
  gallery: GalleryEditor,
  showcase: ShowcaseEditor,
  metrics: MetricsEditor,
  "tech-stack": TechStackEditor,
  "arch-diagram": ArchDiagramEditor,
  media: MediaEditor,
  quote: QuoteEditor,
  timeline: TimelineEditor,
  cta: CtaEditor,
  spacer: SpacerEditor,
} as unknown as Record<string, ComponentType<WidgetEditorProps<never>>>;

export function BlockEditor({
  type,
  data,
  onChange,
}: {
  type: string;
  data: unknown;
  onChange: (next: unknown) => void;
}) {
  const Editor = EDITORS[type];
  if (!Editor) {
    return <p className="text-sm text-fg-faint">Нет редактора для типа «{type}».</p>;
  }
  return <Editor data={data as never} onChange={onChange as (n: never) => void} />;
}
