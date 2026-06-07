import { z } from "zod";
import { defineWidget } from "../types";

export const techStackSchema = z.object({
  title: z.string().default("Стек технологий"),
  items: z.array(z.string()).default([]),
});

export type TechStackData = z.infer<typeof techStackSchema>;

export const techStackDef = defineWidget({
  type: "tech-stack",
  name: "Стек технологий",
  description: "Бейджи использованных технологий",
  category: "content",
  icon: "🧩",
  schema: techStackSchema,
  defaultData: { title: "Стек технологий", items: [] },
});
