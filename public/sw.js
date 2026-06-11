/* Service worker for admin Web Push notifications.
   - push: shows a notification UNLESS the admin is already looking at a view
     that shows this message (the chat list, or the same conversation). A
     focused but DIFFERENT conversation still gets a push.
   - notificationclick: focuses the app and opens the exact conversation. */

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
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const tid = data.threadId;

      // Suppress the OS notification only when a focused window already shows
      // this message: the chat list (the thread bubbles to the top there) or
      // the very same conversation. Any other state — a different conversation,
      // another admin page, the app backgrounded/closed — gets the push.
      const covered = clients.some((c) => {
        const visible = c.focused || c.visibilityState === "visible";
        if (!visible) return false;
        let url;
        try {
          url = new URL(c.url);
        } catch (_e) {
          return false;
        }
        if (!url.pathname.startsWith("/admin/chat")) return false;
        const viewing = url.searchParams.get("t");
        if (!viewing) return true; // on the list → already visible → suppress
        return viewing === tid; // same thread → suppress; different → notify
      });
      if (covered) return;

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
      // Reuse an existing admin window — focus it and navigate to the exact
      // conversation (switches threads if a different one is open).
      for (const c of clients) {
        if (c.url.includes("/admin") && "focus" in c) {
          await c.focus();
          if ("navigate" in c) await c.navigate(url).catch(() => {});
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })()
  );
});
