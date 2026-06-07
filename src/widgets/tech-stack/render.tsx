import type { TechStackData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";

export function TechStackRender({ data }: { data: TechStackData }) {
  const items = data.items.filter(Boolean);
  if (items.length === 0) return null;
  return (
    <Section width="wide">
      <Reveal>
        {data.title ? (
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-faint">
            {data.title}
          </h3>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {items.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-lg border border-bg-border bg-bg-card px-3 py-1.5 font-mono text-sm leading-none text-fg-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
