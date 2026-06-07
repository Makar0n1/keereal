"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/(panel)/actions";
import { useAdminChat } from "./AdminChatProvider";
import { ADMIN_NAV, isNavActive } from "./nav-items";

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  const { unreadTotal } = useAdminChat();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm transition",
            isNavActive(pathname, item)
              ? "bg-bg-card text-fg"
              : "text-fg-muted hover:bg-bg-card/50 hover:text-fg"
          )}
        >
          <span>{item.label}</span>
          {item.href === "/admin/leads" && newLeads > 0 ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
              {newLeads}
            </span>
          ) : null}
          {item.href === "/admin/chat" && unreadTotal > 0 ? (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              {unreadTotal}
            </span>
          ) : null}
        </Link>
      ))}

      <form action={logoutAction} className="mt-4">
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-fg-faint transition hover:text-red-400"
        >
          Выйти
        </button>
      </form>
    </nav>
  );
}
