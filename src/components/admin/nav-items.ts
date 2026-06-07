export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/projects", label: "Проекты" },
  { href: "/admin/pages", label: "Страницы" },
  { href: "/admin/chat", label: "Чат" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/settings", label: "Настройки" },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
