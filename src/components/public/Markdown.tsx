import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Server-rendered markdown with a constrained, typographic prose style.
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-bg-card prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:border prose-pre:border-bg-border prose-pre:bg-bg-card",
        "prose-img:rounded-lg prose-blockquote:border-accent prose-strong:text-fg",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
