import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getStandalonePage, getSettings, toRenderableBlocks } from "@/lib/data";
import { BlockList } from "@/widgets/render-registry";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Обо мне",
    description: `${s.siteName} — ${s.role}.`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const { isEnabled } = await draftMode();
  const [page, settings] = await Promise.all([
    getStandalonePage("about", { preview: isEnabled }),
    getSettings(),
  ]);

  const blocks = page ? toRenderableBlocks(page.blocks) : [];

  return (
    <div className="pb-10">
      {blocks.length > 0 ? (
        <BlockList blocks={blocks} />
      ) : (
        // Sensible default until the page is filled in the admin.
        <div className="mx-auto max-w-prose px-5 py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Обо мне</h1>
          <p className="mt-6 text-lg text-fg-muted">
            {settings.heroSubtitle ||
              "Раздел заполняется в админ-панели через конструктор блоков."}
          </p>
        </div>
      )}
    </div>
  );
}
