import type { MediaData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";

// Normalize common providers to embeddable URLs.
function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url; // assume already embeddable
  } catch {
    return null;
  }
}

export function MediaRender({ data }: { data: MediaData }) {
  const isGif = data.mimeType === "image/gif" || data.url.endsWith(".gif");

  return (
    <Section width="wide">
      <Reveal>
        <figure>
          {data.kind === "embed" && data.embedUrl ? (
            (() => {
              const src = toEmbed(data.embedUrl);
              if (!src) return null;
              return (
                <div className="aspect-video overflow-hidden rounded-xl border border-bg-border">
                  <iframe
                    src={src}
                    title={data.caption || "Видео"}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              );
            })()
          ) : data.url ? (
            isGif ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.url}
                alt={data.caption || ""}
                loading="lazy"
                className="w-full rounded-xl border border-bg-border"
              />
            ) : (
              <video
                src={data.url}
                controls
                preload="none"
                playsInline
                className="w-full rounded-xl border border-bg-border"
              />
            )
          ) : null}
          {data.caption ? (
            <figcaption className="mt-3 text-center text-sm text-fg-faint">{data.caption}</figcaption>
          ) : null}
        </figure>
      </Reveal>
    </Section>
  );
}
