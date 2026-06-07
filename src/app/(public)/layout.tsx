import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ChatWidget } from "@/components/public/ChatWidget";
import { getSettings } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={s.siteName} />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={s.siteName}
        links={{ telegram: s.telegram, github: s.github, email: s.email }}
      />
      <ChatWidget />
    </div>
  );
}
