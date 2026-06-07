"use client";

import { useEffect, type RefObject } from "react";

// Only REAL Safari (desktop, iOS, iPadOS) needs the workaround — its
// visualViewport events are sparse/late. iOS Chrome (CriOS) and iOS Firefox
// (FxiOS), though WebKit under the hood, report events fine and must use the
// smooth event path, so they're excluded here.
function isWebKit(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
}

export function usePinToKeyboard(
  panelRef: RefObject<HTMLElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
  active: boolean,
  maxWidth: number
) {
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const panel = panelRef.current;
    if (!vv || !panel) return;

    const webkit = isWebKit();
    const now = () => performance.now();

    let prevH = 0;
    let anchorBottom: number | null = null;
    let chromeH = 0;
    let contentH = 0;
    let release: ReturnType<typeof setTimeout> | null = null;
    let raf = 0;
    let looping = false;
    let busyUntil = 0;
    let focused = false;
    let baseH = 0; // full visible height (no keyboard)
    let closing = false;
    let preShrink = false; // hold the input high so Safari never scrolls
    let curTop = vv.offsetTop; // eased `top` for Safari (filters the jitter)
    const SMOOTH = 0.1; // lower = slower/smoother follow of offsetTop on Safari

    const isMobile = () => window.innerWidth <= maxWidth;

    // Hard-pin document scroll to 0 (snap to zero instantly, no slow settle).
    const killScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      const de = document.scrollingElement as HTMLElement | null;
      if (de && de.scrollTop !== 0) de.scrollTop = 0;
    };

    const captureAnchor = (): number | null => {
      const sc = scrollRef.current;
      if (!sc) return null;
      const scRect = sc.getBoundingClientRect();
      let chosen: HTMLElement | null = null;
      sc.querySelectorAll<HTMLElement>("[data-chat-msg]").forEach((el) => {
        if (el.getBoundingClientRect().top < scRect.bottom - 4) chosen = el;
      });
      if (!chosen) return null;
      chromeH = panel.offsetHeight - sc.offsetHeight;
      contentH = sc.scrollHeight;
      return (chosen as HTMLElement).getBoundingClientRect().bottom - scRect.top + sc.scrollTop;
    };

    const releaseAnchorSoon = () => {
      if (release) clearTimeout(release);
      release = setTimeout(() => {
        anchorBottom = null;
      }, 250);
    };

    const apply = () => {
      const sc = scrollRef.current;
      if (!isMobile()) {
        panel.style.height = "";
        panel.style.top = "";
        prevH = 0;
        anchorBottom = null;
        return;
      }
      if (webkit && focused) killScroll(); // pin doc scroll to 0
      let h = vv.height;
      // During close: stay at full height immediately (Safari reports the growth
      // late) -> instant restore, no "thoughtful" expand.
      if (closing) {
        h = Math.max(h, baseH);
        if (vv.height >= baseH - 40) closing = false;
      } else if (preShrink) {
        // Hold the panel short (input high above the keyboard) so Safari has no
        // reason to scroll the visual viewport -> offsetTop stays 0, no journey.
        if (baseH - vv.height > 80) {
          preShrink = false; // keyboard height now known -> fit to it
          h = vv.height;
        } else {
          h = Math.round(baseH * 0.5);
        }
      }
      const top = vv.offsetTop;
      // Safari: ease toward offsetTop so its jittery 290->59 settle becomes a
      // smooth, almost-invisible drift (the dark backdrop hides any edge gap).
      // Other engines are already smooth -> snap instantly.
      if (webkit) {
        const d = top - curTop;
        curTop = Math.abs(d) < 0.5 ? top : curTop + d * SMOOTH;
        if (Math.abs(top - curTop) > 0.5) busyUntil = Math.max(busyUntil, now() + 150);
      } else {
        curTop = top;
      }
      const changed = Math.abs(h - prevH) > 1;
      if (changed && anchorBottom === null) anchorBottom = captureAnchor();

      panel.style.height = `${h}px`;
      panel.style.top = `${curTop}px`;
      if (changed && sc && anchorBottom !== null) {
        const msgH = Math.max(0, h - chromeH);
        const max = Math.max(0, contentH - msgH);
        sc.scrollTop = Math.min(Math.max(0, anchorBottom - msgH), max);
      }
      if (changed) {
        busyUntil = now() + 450;
        releaseAnchorSoon();
      }
      prevH = h;
    };

    const loop = () => {
      apply();
      if (focused || closing || now() < busyUntil) requestAnimationFrame(loop);
      else looping = false;
    };
    const startLoop = () => {
      if (!looping) {
        looping = true;
        requestAnimationFrame(loop);
      }
    };

    const onEvent = () => {
      if (webkit) startLoop();
      else if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply();
        });
      }
    };

    // Reactive scroll guard (only when the keyboard is up).
    const onScroll = () => {
      if (webkit && focused) killScroll();
    };

    const onFocusIn = () => {
      if (!isMobile()) return;
      anchorBottom = captureAnchor();
      if (webkit) {
        baseH = vv.height;
        focused = true;
        closing = false;
        preShrink = true;
        killScroll();
        apply(); // shrink synchronously, before Safari decides to scroll
        startLoop();
      }
    };

    const onFocusOut = () => {
      if (!webkit) return;
      focused = false;
      closing = true;
      preShrink = false;
      anchorBottom = captureAnchor();
      busyUntil = now() + 1200;
      apply(); // sets full height right now -> instant restore
      startLoop();
    };

    apply();
    vv.addEventListener("resize", onEvent);
    vv.addEventListener("scroll", onEvent);
    window.addEventListener("resize", onEvent);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("scroll", onScroll, true);
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("focusout", onFocusOut);
    return () => {
      focused = false;
      closing = false;
      busyUntil = 0;
      if (raf) cancelAnimationFrame(raf);
      if (release) clearTimeout(release);
      vv.removeEventListener("resize", onEvent);
      vv.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("scroll", onScroll, true);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("focusout", onFocusOut);
      panel.style.height = "";
      panel.style.top = "";
    };
  }, [active, maxWidth, panelRef, scrollRef]);
}
