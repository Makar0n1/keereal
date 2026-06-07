import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

// Auto-generated OG image. Used when a project has no custom og-image.
// /og            -> site-level card
// /og?slug=foo   -> project card with its title + tags
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const settings = await getSettings();

  let title = settings.heroTitle;
  let subtitle = settings.role;
  let tags: string[] = [];

  if (slug) {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { title: true, excerpt: true, tags: true },
    });
    if (project) {
      title = project.title;
      subtitle = project.excerpt || settings.role;
      tags = project.tags.slice(0, 4);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0b 0%, #141417 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", color: "#5b8cff", fontSize: 30 }}>
          {settings.siteName}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ededef",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 32, marginTop: 24 }}>{subtitle}</div>
          {tags.length > 0 ? (
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    color: "#a1a1aa",
                    fontSize: 24,
                    border: "1px solid #26262b",
                    borderRadius: 999,
                    padding: "8px 20px",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    SIZE
  );
}
