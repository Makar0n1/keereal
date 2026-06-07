import { z } from "zod";
import { defineWidget } from "../types";
import { widthVariant } from "../shared";

export const textSchema = z.object({
  markdown: z.string().default(""),
  width: widthVariant.default("normal"),
});

export type TextData = z.infer<typeof textSchema>;

export const textDef = defineWidget({
  type: "text",
  name: "Текстовый блок",
  description: "Форматированный текст (markdown)",
  category: "content",
  icon: "📝",
  schema: textSchema,
  defaultData: { markdown: "", width: "normal" },
});
