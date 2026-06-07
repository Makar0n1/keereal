import type { z } from "zod";
import type { WidgetDefinition } from "./types";

import { heroCaseDef } from "./hero-case/def";
import { textDef } from "./text/def";
import { problemSolutionDef } from "./problem-solution/def";
import { galleryDef } from "./gallery/def";
import { showcaseDef } from "./showcase/def";
import { metricsDef } from "./metrics/def";
import { techStackDef } from "./tech-stack/def";
import { archDiagramDef } from "./arch-diagram/def";
import { mediaDef } from "./media/def";
import { quoteDef } from "./quote/def";
import { timelineDef } from "./timeline/def";
import { ctaDef } from "./cta/def";
import { spacerDef } from "./spacer/def";

// The canonical, ordered list. Adding a widget = create its folder and add its
// def here (plus its render/editor in the two component registries). No DB
// migration is ever required to introduce a new block type.
export const WIDGETS: WidgetDefinition[] = [
  heroCaseDef,
  textDef,
  problemSolutionDef,
  galleryDef,
  showcaseDef,
  metricsDef,
  techStackDef,
  archDiagramDef,
  mediaDef,
  quoteDef,
  timelineDef,
  ctaDef,
  spacerDef,
];

const BY_TYPE = new Map(WIDGETS.map((w) => [w.type, w]));

export function getWidget(type: string): WidgetDefinition | undefined {
  return BY_TYPE.get(type);
}

export function getDefaultData(type: string): unknown {
  return BY_TYPE.get(type)?.defaultData ?? {};
}

// Validate + coerce a block's raw data against its widget schema. Returns the
// parsed data, or a fallback to defaults if the type is unknown/invalid.
export function parseBlockData(
  type: string,
  raw: unknown
): { ok: true; data: unknown } | { ok: false; error: z.ZodError | string } {
  const widget = BY_TYPE.get(type);
  if (!widget) return { ok: false, error: `Неизвестный тип блока: ${type}` };
  const result = widget.schema.safeParse(raw);
  if (!result.success) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

// Catalog grouped by category, for the admin "add block" picker.
export function getCatalog() {
  return WIDGETS;
}
