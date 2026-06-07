import { z } from "zod";
import { defineWidget } from "../types";

export const spacerSchema = z.object({
  size: z.enum(["sm", "md", "lg"]).default("md"),
  divider: z.boolean().default(false),
});

export type SpacerData = z.infer<typeof spacerSchema>;

export const spacerDef = defineWidget({
  type: "spacer",
  name: "Разделитель / отступ",
  description: "Вертикальный отступ или линия",
  category: "layout",
  icon: "—",
  schema: spacerSchema,
  defaultData: { size: "md", divider: false },
});
