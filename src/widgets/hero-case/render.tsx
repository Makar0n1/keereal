import Image from "next/image";
import type { HeroCaseData } from "./def";
import { Reveal } from "@/components/public/Reveal";

export function HeroCaseRender({ data }: { data: HeroCaseData }) {
  return (
    <section className="px-5 pb-6 pt-12 sm:pt-20">
      <div className="mx-auto max-w-content">
        <Reveal>
          {data.tags.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-bg-border px-3 py-1 text-xs leading-none text-fg-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
            {data.title}
          </h1>
          {data.subtitle ? (
            <p className="mt-5 max-w-2xl text-lg text-fg-muted sm:text-xl">{data.subtitle}</p>
          ) : null}
        </Reveal>

        {data.cover?.url ? (
          <Reveal delay={120}>
            <div className="mt-10 overflow-hidden rounded-2xl border border-bg-border">
              <Image
                src={data.cover.url}
                alt={data.cover.alt}
                width={data.cover.width ?? 1600}
                height={data.cover.height ?? 900}
                priority
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="h-auto w-full object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
