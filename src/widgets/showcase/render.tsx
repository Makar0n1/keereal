import Image from "next/image";
import type { ShowcaseData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";

const gradients: Record<ShowcaseData["gradient"], string> = {
  accent: "from-accent/30 via-bg-soft to-bg",
  violet: "from-fuchsia-500/25 via-bg-soft to-bg",
  sunset: "from-orange-500/25 via-bg-soft to-bg",
  mono: "from-fg/10 via-bg-soft to-bg",
};

export function ShowcaseRender({ data }: { data: ShowcaseData }) {
  if (!data.image?.url) return null;
  const img = data.image;

  const picture = (
    <Image
      src={img.url}
      alt={img.alt}
      width={img.width ?? 1600}
      height={img.height ?? 1000}
      sizes="(max-width: 1024px) 100vw, 1024px"
      className="h-auto w-full"
    />
  );

  return (
    <Section width="wide">
      <Reveal>
        <div
          className={`rounded-2xl bg-gradient-to-b ${gradients[data.gradient]} p-6 sm:p-12`}
        >
          {data.frame === "browser" ? (
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-bg-border bg-bg-card shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-bg-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
              </div>
              {picture}
            </div>
          ) : data.frame === "phone" ? (
            <div className="mx-auto max-w-[300px] overflow-hidden rounded-[2.2rem] border-[10px] border-bg-card bg-bg-card shadow-2xl">
              {picture}
            </div>
          ) : (
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl shadow-2xl">{picture}</div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
