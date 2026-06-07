import { z } from "zod";
import { defineWidget } from "../types";
import { imageSchema, emptyImage } from "../shared";

export const archDiagramSchema = z.object({
  image: imageSchema.optional(),
  caption: z.string().default(""),
});

export type ArchDiagramData = z.infer<typeof archDiagramSchema>;

export const archDiagramDef = defineWidget({
  type: "arch-diagram",
  name: "Архитектурная схема",
  description: "Изображение схемы с зумом по клику",
  category: "media",
  icon: "🗺️",
  schema: archDiagramSchema,
  defaultData: { image: emptyImage, caption: "" },
});
