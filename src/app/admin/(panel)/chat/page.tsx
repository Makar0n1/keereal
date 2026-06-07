import { PageHeader } from "@/components/admin/ui";
import { ChatConsole } from "@/components/admin/ChatConsole";

export const dynamic = "force-dynamic";

export default function AdminChatPage() {
  return (
    <div>
      <PageHeader title="Чат" description="Живые диалоги с посетителями сайта" />
      <ChatConsole />
    </div>
  );
}
