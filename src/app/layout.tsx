import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/env";
import { getSettings } from "@/lib/data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Prevent the auto-zoom when focusing inputs on mobile (iOS).
  maximumScale: 1,
  userScalable: false,
  // Resize the layout viewport when the on-screen keyboard appears (Chrome),
  // so chat composers stay above the keyboard.
  interactiveWidget: "resizes-content",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${s.siteName} — ${s.role}`,
      template: `%s — ${s.siteName}`,
    },
    description: s.heroSubtitle || s.role,
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: s.siteName,
      url: siteUrl,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen antialiased">
        {children}
        {/* Admin-configurable analytics snippet (Yandex.Metrica / Plausible / …).
            Rendered into server HTML so inline scripts execute on initial load. */}
        {s.analyticsSnippet ? (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: s.analyticsSnippet }} />
        ) : null}
      </body>
    </html>
  );
}
