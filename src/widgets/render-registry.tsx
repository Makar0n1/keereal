import type { ComponentType } from "react";
import { parseBlockData } from "./registry";

import { HeroCaseRender } from "./hero-case/render";
import { TextRender } from "./text/render";
import { ProblemSolutionRender } from "./problem-solution/render";
import { GalleryRender } from "./gallery/render";
import { ShowcaseRender } from "./showcase/render";
import { MetricsRender } from "./metrics/render";
import { TechStackRender } from "./tech-stack/render";
import { ArchDiagramRender } from "./arch-diagram/render";
import { MediaRender } from "./media/render";
import { QuoteRender } from "./quote/render";
import { TimelineRender } from "./timeline/render";
import { CtaRender } from "./cta/render";
import { SpacerRender } from "./spacer/render";

// Server-side render components, keyed by widget type. Keeping this separate
// from the editor registry prevents client editor code from leaking into the
// public bundle.
const RENDERERS: Record<string, ComponentType<{ data: never }>> = {
  "hero-case": HeroCaseRender,
  text: TextRender,
  "problem-solution": ProblemSolutionRender,
  gallery: GalleryRender,
  showcase: ShowcaseRender,
  metrics: MetricsRender,
  "tech-stack": TechStackRender,
  "arch-diagram": ArchDiagramRender,
  media: MediaRender,
  quote: QuoteRender,
  timeline: TimelineRender,
  cta: CtaRender,
  spacer: SpacerRender,
} as unknown as Record<string, ComponentType<{ data: never }>>;

export interface RenderableBlock {
  id: string;
  type: string;
  data: unknown;
  isVisible: boolean;
}

// Renders a single block. Unknown types and invalid data are skipped silently
// on the public site (forward-compatible with widgets added later).
export function BlockRenderer({ block }: { block: RenderableBlock }) {
  if (!block.isVisible) return null;
  const Component = RENDERERS[block.type];
  if (!Component) return null;
  const parsed = parseBlockData(block.type, block.data);
  if (!parsed.ok) return null;
  return <Component data={parsed.data as never} />;
}

export function BlockList({ blocks }: { blocks: RenderableBlock[] }) {
  return (
    <>
      {blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
    </>
  );
}
