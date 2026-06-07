"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/(panel)/actions";
import { useAdminChat } from "./AdminChatProvider";
import { ADMIN_NAV, isNavActive } from "./nav-items";
import { Menu, X, ExternalLink } from "lucide-react";

// Sticky mobile top bar with a hamburger dropdown. Shown only below `lg`.
export function AdminMobileNav({ email, newLeads }: { email: string; newLeads: number }) {
  const pathname = usePathname();
  const { unreadTotal } = useAdminChat();
  const [open, setOpen] = useState(false);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const current = ADMIN_NAV.find((i) => isNavActive(pathname, i));
  const totalBadge = newLeads + unreadTotal;

  return (
    <div className="sticky top-0 z-50 border-b border-bg-border bg-bg/90 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold leading-tight">
            {current?.label ?? "Управление"}
          </p>
          <p className="truncate text-[11px] text-fg-faint">{email}</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={open}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-bg-border text-fg"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
          {!open && totalBadge > 0 ? (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="border-t border-bg-border px-3 pb-3 pt-2">
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-3 text-base transition",
                  isNavActive(pathname, item)
                    ? "bg-bg-card text-fg"
                    : "text-fg-muted active:bg-bg-card/60"
                )}
              >
                <span>{item.label}</span>
                {item.href === "/admin/leads" && newLeads > 0 ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">{newLeads}</span>
                ) : null}
                {item.href === "/admin/chat" && unreadTotal > 0 ? (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">{unreadTotal}</span>
                ) : null}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-bg-border pt-2">
              <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-fg-faint">
                <ExternalLink size={14} /> Открыть сайт
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="px-3 py-2 text-sm text-red-400">
                  Выйти
                </button>
              </form>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
