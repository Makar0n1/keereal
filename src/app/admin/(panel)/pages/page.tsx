import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, Card } from "@/components/admin/ui";

// Registry of standalone (singleton) pages that are built from blocks.
const STANDALONE_PAGES = [
  { key: "about", title: "Обо мне", path: "/about" },
];

export default function AdminPagesList() {
  return (
    <div>
      <PageHeader title="Страницы" description="Контентные страницы, собираемые из блоков" />
      <Card className="divide-y divide-bg-border p-0">
        {STANDALONE_PAGES.map((p) => (
          <Link
            key={p.key}
            href={`/admin/pages/${p.key}`}
            className="flex items-center justify-between p-4 transition hover:bg-bg-card/50"
          >
            <div>
              <p className="font-medium text-fg">{p.title}</p>
              <p className="font-mono text-xs text-fg-faint">{p.path}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-fg-faint" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
