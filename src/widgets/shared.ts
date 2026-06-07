import { z } from "zod";

// Shared sub-schemas used by multiple widgets.

// An image reference. We store the resolved URL + alt directly in the block
// data (denormalized) so rendering needs no extra joins; mediaId links back to
// the Media row for management. alt is required for accessibility/SEO.
export const imageSchema = z.object({
  mediaId: z.string().optional(),
  url: z.string().min(1, "Загрузите изображение"),
  alt: z.string().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
  caption: z.string().optional(),
});
export type ImageValue = z.infer<typeof imageSchema>;

export const widthVariant = z.enum(["narrow", "normal", "wide", "full"]);
export type WidthVariant = z.infer<typeof widthVariant>;

export const emptyImage: ImageValue = { url: "", alt: "" };
