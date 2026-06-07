"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";
import { LightboxModal } from "@/components/public/Lightbox";

const colClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function GalleryRender({ data }: { data: GalleryData }) {
  const images = data.images.filter((i) => i.url);
  const [index, setIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <Section width="wide">
      <div className={`grid grid-cols-1 gap-3 ${colClass[data.columns] ?? colClass[3]}`}>
        {images.map((img, i) => (
          <Reveal key={i} delay={i * 60}>
            <figure>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group block w-full overflow-hidden rounded-lg border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={img.width ?? 800}
                  height={img.height ?? 600}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </button>
              {img.caption ? (
                <figcaption className="mt-2 text-center text-xs text-fg-faint">
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
          </Reveal>
        ))}
      </div>
      <LightboxModal images={images} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </Section>
  );
}
