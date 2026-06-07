import { z } from "zod";
import { defineWidget } from "../types";
import { imageSchema, emptyImage } from "../shared";

export const showcaseSchema = z.object({
  image: imageSchema.optional(),
  frame: z.enum(["none", "browser", "phone"]).default("browser"),
  gradient: z.enum(["accent", "violet", "sunset", "mono"]).default("accent"),
});

export type ShowcaseData = z.infer<typeof showcaseSchema>;

export const showcaseDef = defineWidget({
  type: "showcase",
  name: "Showcase-мокап",
  description: "Крупный скрин на градиентной подложке",
  category: "media",
  icon: "💻",
  schema: showcaseSchema,
  defaultData: { image: emptyImage, frame: "browser", gradient: "accent" },
});
