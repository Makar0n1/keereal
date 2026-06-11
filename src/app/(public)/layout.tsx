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
    <>
      {/* Page content, hidden on mobile while the chat app-shell is open so
          Safari has no scrollable background to scroll on input focus. */}
      <div id="pf-page" className="flex min-h-screen flex-col">
        <Header siteName={s.siteName} />
        <main className="flex-1">{children}</main>
        <Footer
          siteName={s.siteName}
          links={{ telegram: s.telegram, github: s.github, email: s.email }}
        />
      </div>
      {/* Outside #pf-page so hiding the page never hides the chat. */}
      <ChatWidget />
    </>
  );
}
