"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChatEvent } from "@/lib/chat-bus";

export interface ThreadItem {
  id: string;
  visitorId: string;
  unread: number;
  lastMessageAt: string;
  lastBody: string;
  lastSender: "VISITOR" | "ADMIN" | null;
  visitorName: string | null;
  visitorContact: string | null;
  leadsCount: number;
}

interface Ctx {
  threads: ThreadItem[];
  unreadTotal: number;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  reload: () => Promise<void>;
  subscribe: (fn: (evt: ChatEvent) => void) => () => void;
  markThreadRead: (threadId: string) => void;
  soundOn: boolean;
  toggleSound: () => void;
}

const ChatCtx = createContext<Ctx | null>(null);

export function useAdminChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useAdminChat must be used within AdminChatProvider");
  return ctx;
}

function useBeep() {
  const ref = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ref.current = ref.current ?? new Ctor();
      const ctx = ref.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 760;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      o.start();
      o.stop(ctx.currentTime + 0.31);
    } catch {
      /* blocked */
    }
  }, []);
}

export function AdminChatProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const listeners = useRef<Set<(evt: ChatEvent) => void>>(new Set());
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;
  const beep = useBeep();

  const unreadTotal = useMemo(() => threads.reduce((sum, t) => sum + t.unread, 0), [threads]);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/threads");
      const data = await res.json();
      if (Array.isArray(data.threads)) setThreads(data.threads);
    } catch {
      /* ignore */
    }
  }, []);

  const subscribe = useCallback((fn: (evt: ChatEvent) => void) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)));
    fetch("/api/admin/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId }),
    }).catch(() => {});
  }, []);

  // Load preferences + initial threads.
  useEffect(() => {
    setSoundOn(localStorage.getItem("pf_admin_sound") === "1");
    reload();
  }, [reload]);

  // Single realtime stream for the whole admin.
  useEffect(() => {
    const es = new EventSource("/api/admin/chat/stream");
    es.onmessage = (e) => {
      let evt: ChatEvent;
      try {
        evt = JSON.parse(e.data);
      } catch {
        return;
      }

      // Fan out every event to conversation listeners (active thread view).
      listeners.current.forEach((fn) => fn(evt));

      if (evt.kind === "message") {
        const m = evt.message;
        setThreads((prev) => {
          const idx = prev.findIndex((t) => t.id === evt.threadId);
          const isActive = activeRef.current === evt.threadId;
          const bumpUnread = m.sender === "VISITOR" && !isActive;

          if (idx === -1) {
            // New thread: pull fresh list to get visitor details.
            reload();
            return prev;
          }
          const updated: ThreadItem = {
            ...prev[idx]!,
            lastBody: m.body,
            lastSender: m.sender,
            lastMessageAt: m.createdAt,
            unread: bumpUnread ? prev[idx]!.unread + 1 : prev[idx]!.unread,
          };
          const next = [updated, ...prev.filter((_, i) => i !== idx)];
          return next;
        });

        // Ping on every incoming message unless we're actively looking at that
        // thread with the tab focused.
        const activelyViewing = activeRef.current === evt.threadId && !document.hidden;
        if (m.sender === "VISITOR" && !activelyViewing) {
          if (localStorage.getItem("pf_admin_sound") === "1") beep();
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("Новое сообщение в чате", { body: m.body.slice(0, 120) });
          }
        }
      } else if (evt.kind === "read" && evt.by === "ADMIN") {
        setThreads((prev) => prev.map((t) => (t.id === evt.threadId ? { ...t, unread: 0 } : t)));
      }
    };
    return () => es.close();
  }, [beep, reload]);

  // Tab-title blink while there are unread chat messages and the tab is hidden.
  useEffect(() => {
    if (unreadTotal <= 0) return;
    const original = document.title;
    let on = false;
    const id = setInterval(() => {
      if (!document.hidden) return;
      document.title = on ? original : `💬 (${unreadTotal}) Новое сообщение`;
      on = !on;
    }, 1000);
    const restore = () => {
      if (!document.hidden) document.title = original;
    };
    document.addEventListener("visibilitychange", restore);
    return () => {
      clearInterval(id);
      document.title = original;
      document.removeEventListener("visibilitychange", restore);
    };
  }, [unreadTotal]);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem("pf_admin_sound", next ? "1" : "0");
      if (next) {
        beep();
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }
      }
      return next;
    });
  }, [beep]);

  const value: Ctx = {
    threads,
    unreadTotal,
    activeId,
    setActiveId,
    reload,
    subscribe,
    markThreadRead,
    soundOn,
    toggleSound,
  };

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}
