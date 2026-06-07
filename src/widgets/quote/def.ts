import { z } from "zod";
import { defineWidget } from "../types";

export const quoteSchema = z.object({
  text: z.string().default(""),
  author: z.string().default(""),
  role: z.string().default(""),
});

export type QuoteData = z.infer<typeof quoteSchema>;

export const quoteDef = defineWidget({
  type: "quote",
  name: "Цитата / отзыв",
  description: "Выделенная цитата с автором",
  category: "content",
  icon: "❝",
  schema: quoteSchema,
  defaultData: { text: "", author: "", role: "" },
});
