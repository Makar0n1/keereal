import { z } from "zod";
import { defineWidget } from "../types";

export const ctaSchema = z.object({
  title: z.string().default("Обсудим ваш проект?"),
  text: z.string().default(""),
  buttonLabel: z.string().default("Связаться"),
  // When true, embed the contact form inline instead of a button to /contact.
  useContactForm: z.boolean().default(false),
});

export type CtaData = z.infer<typeof ctaSchema>;

export const ctaDef = defineWidget({
  type: "cta",
  name: "CTA-блок",
  description: "Призыв к действию: кнопка или форма связи",
  category: "conversion",
  icon: "🎯",
  schema: ctaSchema,
  defaultData: {
    title: "Обсудим ваш проект?",
    text: "",
    buttonLabel: "Связаться",
    useContactForm: false,
  },
});
