import { z } from "zod";
import { defineWidget } from "../types";
import { imageSchema } from "../shared";

export const gallerySchema = z.object({
  images: z.array(imageSchema).default([]),
  columns: z.coerce.number().int().min(2).max(4).default(3),
});

export type GalleryData = z.infer<typeof gallerySchema>;

export const galleryDef = defineWidget({
  type: "gallery",
  name: "Галерея скриншотов",
  description: "Сетка изображений с лайтбоксом",
  category: "media",
  icon: "🖼️",
  schema: gallerySchema,
  defaultData: { images: [], columns: 3 },
});
