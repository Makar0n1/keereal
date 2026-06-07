import { z } from "zod";

// Public contact submission. honeypot + elapsedMs are anti-spam signals.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(120),
  contact: z.string().trim().min(1, "Укажите контакт").max(200),
  message: z.string().trim().min(1, "Напишите сообщение").max(5000),
  website: z.string().optional().default(""), // honeypot
  elapsedMs: z.number().optional().default(0),
  pageSource: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Minimum time (ms) a human plausibly needs to fill the form.
export const MIN_FILL_MS = 2000;

// --- Admin: project meta ---
export const publishStatus = z.enum(["DRAFT", "PUBLISHED"]);

export const projectMetaSchema = z.object({
  title: z.string().trim().min(1, "Укажите название").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите slug")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  excerpt: z.string().max(400).default(""),
  coverId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  status: publishStatus.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  sort: z.number().int().default(0),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(400).nullable().optional(),
  ogImageId: z.string().nullable().optional(),
});

export type ProjectMetaInput = z.infer<typeof projectMetaSchema>;

// --- Admin: a single block in the builder payload ---
export const blockInputSchema = z.object({
  // Present for existing blocks; absent/empty for newly added ones.
  id: z.string().optional(),
  type: z.string().min(1),
  isVisible: z.boolean().default(true),
  data: z.unknown(),
});

export const saveBlocksSchema = z.object({
  pageId: z.string().min(1),
  blocks: z.array(blockInputSchema),
});

export type BlockInput = z.infer<typeof blockInputSchema>;

// --- Admin: settings ---
export const settingsSchema = z.object({
  siteName: z.string().max(120),
  role: z.string().max(160),
  heroTitle: z.string().max(200),
  heroSubtitle: z.string().max(600),
  email: z.string().max(160),
  telegram: z.string().max(200),
  github: z.string().max(200),
  contactText: z.string().max(600),
  analyticsSnippet: z.string().max(20000),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// --- Admin: lead update ---
export const leadStatus = z.enum(["NEW", "IN_PROGRESS", "CLOSED"]);
export const leadUpdateSchema = z.object({
  id: z.string().min(1),
  status: leadStatus.optional(),
  note: z.string().max(2000).nullable().optional(),
});
