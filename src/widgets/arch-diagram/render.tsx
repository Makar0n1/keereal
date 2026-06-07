"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArchDiagramData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";
import { LightboxModal } from "@/components/public/Lightbox";

export function ArchDiagramRender({ data }: { data: ArchDiagramData }) {
  const [open, setOpen] = useState(false);
  if (!data.image?.url) return null;
  const img = { ...data.image, caption: data.caption };

  return (
    <Section width="wide">
      <Reveal>
        <figure>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-bg-border bg-bg-card p-4"
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={img.width ?? 1600}
              height={img.height ?? 900}
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="h-auto w-full object-contain"
            />
          </button>
          <figcaption className="mt-3 text-center text-sm text-fg-faint">
            {data.caption ? `${data.caption} · ` : ""}нажмите, чтобы увеличить
          </figcaption>
        </figure>
      </Reveal>
      <LightboxModal
        images={[img]}
        index={open ? 0 : null}
        onClose={() => setOpen(false)}
        onIndex={() => {}}
      />
    </Section>
  );
}
