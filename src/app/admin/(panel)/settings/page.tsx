import { getSettings } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <PageHeader title="Настройки" description="Глобальные параметры сайта" />
      <SettingsForm
        initial={{
          siteName: s.siteName,
          role: s.role,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          email: s.email,
          telegram: s.telegram,
          github: s.github,
          contactText: s.contactText,
          analyticsSnippet: s.analyticsSnippet,
        }}
      />
    </div>
  );
}
