import { z } from "zod";
import { defineWidget } from "../types";

export const mediaSchema = z.object({
  kind: z.enum(["upload", "embed"]).default("upload"),
  // For uploaded video/gif: a stored file URL.
  url: z.string().default(""),
  mimeType: z.string().default(""),
  // For embeds: a provider URL (YouTube/Vimeo) — converted to an iframe.
  embedUrl: z.string().default(""),
  caption: z.string().default(""),
});

export type MediaData = z.infer<typeof mediaSchema>;

export const mediaDef = defineWidget({
  type: "media",
  name: "Видео / GIF",
  description: "Загруженный файл или встраивание, lazy",
  category: "media",
  icon: "🎬",
  schema: mediaSchema,
  defaultData: { kind: "upload", url: "", mimeType: "", embedUrl: "", caption: "" },
});
