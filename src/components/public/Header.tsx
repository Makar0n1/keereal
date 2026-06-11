"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/projects", label: "Проекты" },
  { href: "/about", label: "Обо мне" },
  { href: "/contact", label: "Контакты" },
];

export function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-bg-border/60 bg-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Link href="/" className="font-mono text-[1.3125rem] font-semibold leading-none tracking-tight text-fg">
          {siteName}
        </Link>

        <nav className="hidden gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition",
                isActive(item.href)
                  ? "text-fg"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="text-fg sm:hidden"
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-bg-border bg-bg sm:hidden">
          <div className="mx-auto flex max-w-content flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-3 text-base transition",
                  isActive(item.href) ? "text-fg" : "text-fg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
