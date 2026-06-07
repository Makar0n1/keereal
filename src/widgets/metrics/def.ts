import { z } from "zod";
import { defineWidget } from "../types";

export const metricsSchema = z.object({
  items: z
    .array(
      z.object({
        value: z.string().default(""),
        label: z.string().default(""),
      })
    )
    .default([]),
});

export type MetricsData = z.infer<typeof metricsSchema>;

export const metricsDef = defineWidget({
  type: "metrics",
  name: "Метрики / цифры",
  description: "2–4 крупных показателя с подписями",
  category: "content",
  icon: "📊",
  schema: metricsSchema,
  defaultData: {
    items: [
      { value: "", label: "" },
      { value: "", label: "" },
    ],
  },
});
