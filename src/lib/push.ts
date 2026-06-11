import "server-only";
import webpush from "web-push";
import { prisma } from "./prisma";
import { env, siteUrl } from "./env";

// Web Push for the admin's installed PWA. Configured only when VAPID keys are
// present; otherwise every helper is a no-op and the app falls back to in-tab
// notifications.
export const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

let configured = false;
function ensureConfigured() {
  if (configured || !pushEnabled) return;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Fire a push to every stored admin subscription. Best-effort: dead endpoints
// (404/410 Gone) are pruned. Never throws — callers fire-and-forget.
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  if (!pushEnabled) return;
  ensureConfigured();

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return;

  const body = JSON.stringify({ url: `${siteUrl}/admin/chat`, ...payload });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          // Subscription expired/unsubscribed — drop it.
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
