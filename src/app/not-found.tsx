import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 text-fg">
      <div className="text-center">
        <p className="font-mono text-7xl font-semibold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Страница не найдена</h1>
        <p className="mt-2 text-fg-muted">
          Возможно, ссылка устарела или страница была перемещена.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent/90"
          >
            На главную
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-bg-border px-5 py-2.5 font-medium transition hover:border-accent/50"
          >
            К проектам
          </Link>
        </div>
      </div>
    </div>
  );
}
