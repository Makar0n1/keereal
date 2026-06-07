import { z } from "zod";
import { defineWidget } from "../types";
import { imageSchema, emptyImage } from "../shared";

export const heroCaseSchema = z.object({
  title: z.string().min(1, "Укажите название"),
  subtitle: z.string().default(""),
  cover: imageSchema.optional(),
  tags: z.array(z.string()).default([]),
});

export type HeroCaseData = z.infer<typeof heroCaseSchema>;

export const heroCaseDef = defineWidget({
  type: "hero-case",
  name: "Hero кейса",
  description: "Название, суть, обложка и теги",
  category: "content",
  icon: "🪧",
  schema: heroCaseSchema,
  defaultData: { title: "", subtitle: "", cover: emptyImage, tags: [] },
});
