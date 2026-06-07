import type { TimelineData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";

export function TimelineRender({ data }: { data: TimelineData }) {
  const items = data.items.filter((i) => i.title || i.description);
  if (items.length === 0) return null;
  return (
    <Section width="normal">
      <ol className="relative border-l border-bg-border">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 70}>
            <li className="mb-8 ml-6 last:mb-0">
              <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-bg bg-accent" />
              {it.date ? (
                <span className="text-xs font-medium uppercase tracking-wider text-fg-faint">
                  {it.date}
                </span>
              ) : null}
              <h4 className="mt-1 text-lg font-semibold text-fg">{it.title}</h4>
              {it.description ? (
                <p className="mt-1 text-sm text-fg-muted">{it.description}</p>
              ) : null}
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
