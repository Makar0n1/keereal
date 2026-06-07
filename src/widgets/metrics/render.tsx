import type { MetricsData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";
import { cn } from "@/lib/utils";

// Mobile-safe column counts: 4 items -> 2×2 on mobile, full row on desktop.
const colClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function MetricsRender({ data }: { data: MetricsData }) {
  const items = data.items.filter((m) => m.value || m.label);
  if (items.length === 0) return null;
  const cols = Math.min(items.length, 4);

  return (
    <Section width="wide">
      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-xl border border-bg-border bg-bg-border",
          colClass[cols] ?? "grid-cols-2"
        )}
      >
        {items.map((m, i) => (
          <Reveal key={i} delay={i * 80} className="h-full">
            <div className="flex h-full flex-col items-center justify-center bg-bg-card p-6 text-center sm:p-8">
              <div className="text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
                {m.value}
              </div>
              <div className="mt-2 text-sm text-fg-muted">{m.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
