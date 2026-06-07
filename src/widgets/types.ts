import type { z } from "zod";
import type { ComponentType } from "react";

// Catalog grouping for the "add block" picker in the admin.
export type WidgetCategory = "content" | "media" | "layout" | "conversion";

// A widget definition is the schema + metadata. It is framework-agnostic and
// safe to import on both server (render) and client (admin) without pulling in
// React component code. Render/editor components live in sibling files and are
// wired through their own registries to keep client/server bundles separate.
export interface WidgetDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  type: string;
  name: string; // human label (RU)
  description: string; // short caption in the catalog
  category: WidgetCategory;
  icon: string; // emoji/glyph for the catalog tile
  schema: TSchema;
  defaultData: z.infer<TSchema>;
}

export function defineWidget<TSchema extends z.ZodTypeAny>(
  def: WidgetDefinition<TSchema>
): WidgetDefinition<TSchema> {
  return def;
}

// Props contracts for the two component kinds.
export interface WidgetRenderProps<T = unknown> {
  data: T;
}

export interface WidgetEditorProps<T = unknown> {
  data: T;
  onChange: (next: T) => void;
}

export type WidgetRenderComponent<T = unknown> = ComponentType<WidgetRenderProps<T>>;
export type WidgetEditorComponent<T = unknown> = ComponentType<WidgetEditorProps<T>>;

// Reusable sub-schemas shared across widgets are defined in ./shared.
