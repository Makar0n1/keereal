import { z } from "zod";
import { defineWidget } from "../types";

export const timelineSchema = z.object({
  items: z
    .array(
      z.object({
        date: z.string().default(""),
        title: z.string().default(""),
        description: z.string().default(""),
      })
    )
    .default([]),
});

export type TimelineData = z.infer<typeof timelineSchema>;

export const timelineDef = defineWidget({
  type: "timeline",
  name: "Таймлайн этапов",
  description: "Последовательность шагов проекта",
  category: "content",
  icon: "🧭",
  schema: timelineSchema,
  defaultData: { items: [{ date: "", title: "", description: "" }] },
});
