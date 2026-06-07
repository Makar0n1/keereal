import Link from "next/link";

export function Footer({
  siteName,
  links,
}: {
  siteName: string;
  links: { telegram?: string; github?: string; email?: string };
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-bg-border">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm text-fg">{siteName}</p>
          <p className="mt-1 text-xs text-fg-faint">© {year}. Все права защищены.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-fg-muted">
          {links.telegram ? (
            <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
              Telegram
            </a>
          ) : null}
          {links.github ? (
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
              GitHub
            </a>
          ) : null}
          {links.email ? (
            <a href={`mailto:${links.email}`} className="hover:text-fg">
              Email
            </a>
          ) : null}
          <Link href="/contact" className="hover:text-fg">
            Связаться
          </Link>
        </div>
      </div>
    </footer>
  );
}
