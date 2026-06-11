"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";

// Web Push opt-in for the admin's installed PWA. Renders a slim banner until
// notifications are enabled (or the visitor dismisses it for this session).
// Enabling MUST happen from a user tap — iOS only grants permission then.

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  // Back with a concrete ArrayBuffer so it satisfies BufferSource (DOM types).
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "off" | "on" | "blocked";

export function PushSetup() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect support + current subscription on mount.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setState("unsupported");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (sub) setState("on");
        else if (Notification.permission === "denied") setState("blocked");
        else setState("off");
      } catch {
        setState("unsupported");
      }
    })();
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "blocked" : "off");
        return;
      }
      const keyRes = await fetch("/api/admin/push/key");
      const { enabled, publicKey } = await keyRes.json();
      if (!enabled || !publicKey) {
        setError("Push не настроен на сервере (нет VAPID-ключей).");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setError("Не удалось включить уведомления. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }, []);

  // Enabled — show a tiny "on" confirmation row (lets the admin turn it off).
  if (state === "on") {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-bg-border bg-bg-soft px-3 py-2 text-xs text-fg-muted">
        <BellRing size={14} className="text-accent" />
        <span>Push-уведомления включены на этом устройстве.</span>
        <button
          onClick={disable}
          disabled={busy}
          className="ml-auto text-fg-faint underline-offset-2 hover:text-fg hover:underline disabled:opacity-50"
        >
          Выключить
        </button>
      </div>
    );
  }

  if (state === "loading" || state === "unsupported" || dismissed) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
      <Bell size={18} className="mt-0.5 shrink-0 text-accent" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-fg">
          Уведомления о новых сообщениях
        </p>
        <p className="mt-0.5 text-fg-muted">
          {state === "blocked"
            ? "Уведомления заблокированы в настройках браузера/устройства — разрешите их для этого сайта, чтобы получать сообщения при закрытом приложении."
            : "Включите, чтобы получать сообщения из чата, даже когда приложение закрыто."}
          {error ? <span className="mt-1 block text-red-400">{error}</span> : null}
        </p>
        {state !== "blocked" ? (
          <button
            onClick={enable}
            disabled={busy}
            className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            {busy ? "Включаю…" : "Включить уведомления"}
          </button>
        ) : null}
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Скрыть"
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-fg-faint transition hover:bg-bg-soft hover:text-fg"
      >
        <X size={16} />
      </button>
    </div>
  );
}
