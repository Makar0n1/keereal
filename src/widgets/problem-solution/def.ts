import { z } from "zod";
import { defineWidget } from "../types";

export const problemSolutionSchema = z.object({
  problemTitle: z.string().default("Проблема"),
  problem: z.string().default(""),
  solutionTitle: z.string().default("Решение"),
  solution: z.string().default(""),
});

export type ProblemSolutionData = z.infer<typeof problemSolutionSchema>;

export const problemSolutionDef = defineWidget({
  type: "problem-solution",
  name: "Проблема → Решение",
  description: "Две колонки: задача и её решение",
  category: "content",
  icon: "⚖️",
  schema: problemSolutionSchema,
  defaultData: {
    problemTitle: "Проблема",
    problem: "",
    solutionTitle: "Решение",
    solution: "",
  },
});
