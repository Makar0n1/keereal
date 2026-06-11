/* Service worker for admin Web Push notifications.
   Shows a notification on `push`, and focuses/opens the chat on click. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: "Новое сообщение", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    (async () => {
      // If the admin app is already focused/visible, the in-app UI handles the
      // alert — don't double-notify with an OS notification.
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const focused = clients.some(
        (c) => c.focused || c.visibilityState === "visible"
      );
      if (focused) return;

      await self.registration.showNotification(data.title || "Новое сообщение", {
        body: data.body || "",
        icon: "/apple-icon",
        badge: "/icon",
        tag: data.tag || "chat",
        renotify: true,
        data: { url: data.url || "/admin/chat" },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/chat";

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const c of clients) {
        // Reuse an existing admin window if there is one.
        if (c.url.includes("/admin") && "focus" in c) {
          await c.focus();
          if ("navigate" in c && !c.url.includes("/admin/chat")) {
            await c.navigate(url).catch(() => {});
          }
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })()
  );
});
