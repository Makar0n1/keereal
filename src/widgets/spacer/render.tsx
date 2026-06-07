import type { SpacerData } from "./def";

const sizeMap: Record<SpacerData["size"], string> = {
  sm: "h-6 sm:h-8",
  md: "h-10 sm:h-16",
  lg: "h-16 sm:h-28",
};

export function SpacerRender({ data }: { data: SpacerData }) {
  return (
    <div className={`flex items-center justify-center ${sizeMap[data.size]}`}>
      {data.divider ? (
        <div className="mx-auto h-px w-full max-w-content bg-bg-border" />
      ) : null}
    </div>
  );
}
