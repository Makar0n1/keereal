import type { ProblemSolutionData } from "./def";
import { Section } from "@/components/public/Section";
import { Markdown } from "@/components/public/Markdown";
import { Reveal } from "@/components/public/Reveal";

export function ProblemSolutionRender({ data }: { data: ProblemSolutionData }) {
  return (
    <Section width="wide">
      <div className="grid gap-5 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-xl border border-bg-border bg-bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-faint">
              {data.problemTitle}
            </h3>
            <Markdown className="prose-sm">{data.problem}</Markdown>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="h-full rounded-xl border border-accent/30 bg-accent/5 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              {data.solutionTitle}
            </h3>
            <Markdown className="prose-sm">{data.solution}</Markdown>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
