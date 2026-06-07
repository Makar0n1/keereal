import type { TextData } from "./def";
import { Section } from "@/components/public/Section";
import { Markdown } from "@/components/public/Markdown";
import { Reveal } from "@/components/public/Reveal";

export function TextRender({ data }: { data: TextData }) {
  if (!data.markdown.trim()) return null;
  return (
    <Section width={data.width}>
      <Reveal>
        <Markdown>{data.markdown}</Markdown>
      </Reveal>
    </Section>
  );
}
