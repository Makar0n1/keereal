import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { WidthVariant } from "@/widgets/shared";

const widthMap: Record<WidthVariant, string> = {
  narrow: "max-w-prose",
  normal: "max-w-3xl",
  wide: "max-w-content",
  full: "max-w-none",
};

// Block wrapper providing consistent vertical rhythm + width control.
export function Section({
  width = "normal",
  className,
  children,
}: {
  width?: WidthVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-5 py-8 sm:py-10">
      <div className={cn("mx-auto", widthMap[width], className)}>{children}</div>
    </section>
  );
}
