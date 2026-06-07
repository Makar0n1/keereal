import type { QuoteData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";

export function QuoteRender({ data }: { data: QuoteData }) {
  if (!data.text.trim()) return null;
  return (
    <Section width="normal">
      <Reveal>
        <figure className="border-l-2 border-accent pl-6">
          <blockquote className="text-xl font-medium leading-relaxed text-fg sm:text-2xl">
            «{data.text}»
          </blockquote>
          {data.author ? (
            <figcaption className="mt-4 text-sm text-fg-muted">
              <span className="font-semibold text-fg">{data.author}</span>
              {data.role ? <span className="text-fg-faint"> — {data.role}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      </Reveal>
    </Section>
  );
}
