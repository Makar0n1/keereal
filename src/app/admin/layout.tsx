import type { Metadata } from "next";

// Whole admin area (login + panel): never index. Adds <meta name="robots"
// content="noindex, nofollow"> on top of the X-Robots-Tag header from middleware.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
