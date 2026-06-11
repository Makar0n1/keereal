"use client";

import { useEffect, type RefObject } from "react";

// Keyboard handling, Telegram-Web style.
//
// The document is locked (see useBodyScrollLock: html/body fixed, overflow
// hidden) and here we ONLY resize HEIGHT to the visual viewport. `top` follows
// visualViewport.offsetTop but is SNAPPED — never eased. The earlier Safari
// workaround eased `top` to hide its jittery offsetTop settle, and THAT easing
// was the visible "slow drift up". Telegram avoids the whole problem: with the
// body locked + sized to the visual viewport, the focused input stays above the
// keyboard, so iOS has nothing to scroll and offsetTop stays ~0 — no drift, no
// jitter. One code path for Blink / Gecko / WebKit.
//
// The only engine-specific concession: Safari fires visualViewport events
// sparsely during the keyboard animation, so on focus transitions we also poll
// for a short window (rAF) to follow the animation frame-by-frame.

// Remembered keyboard height (Safari tab pre-shrink). Module-scope so the very
// first focus of the next open is already accurate.
let cachedKb = 0;

// `appShell`: the chat is rendered as a normal-flow element inside a
// non-scrolling document (page hidden, no position:fixed around the input — see
// ChatWidget). That structure removes BOTH causes of the iOS Safari quirk
// (scrollable page + input inside position:fixed), so we don't need the guard,
// the pre-shrink, or any `top` handling at all — only resize the height.
export function usePinToKeyboard(
  panelRef: RefObject<HTMLElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
  active: boolean,
  maxWidth: number,
  appShell = false
) {
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const panel = panelRef.current;
    if (!vv || !panel) return;

    const now = () => performance.now();
    const isMobile = () => window.innerWidth <= maxWidth;

    // In a real Safari TAB (not a standalone PWA) visualViewport.offsetTop is
    // unreliable and Safari scrolls the page on input focus -> the panel "flies
    // up for a split second, then returns". A reactive scroll guard pins the
    // document at 0 so offsetTop stays ~0. Standalone PWA, Chrome and Firefox
    // all behave and DON'T need it (it would only add micro-jank there).
    const isStandalone =
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    const isWebKit = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(
      navigator.userAgent
    );
    // App-shell removes the root cause, so the Safari-tab guard/pre-shrink is
    // unnecessary there (and would only fight a problem that no longer exists).
    const guard = isWebKit && !isStandalone && !appShell;
    let focused = false;
    let baseH = 0; // full visible height captured at focus (no keyboard yet)
    let preShrink = false; // Safari tab: hold the input high before Safari scrolls
    const killScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      const de = document.scrollingElement as HTMLElement | null;
      if (de && de.scrollTop !== 0) de.scrollTop = 0;
    };

    let prevH = 0;
    let anchorBottom: number | null = null;
    let chromeH = 0;
    let contentH = 0;
    let release: ReturnType<typeof setTimeout> | null = null;
    let raf = 0;
    let looping = false;
    let loopUntil = 0;

    // Bottom edge (in content coords) of the lowest message currently visible —
    // we keep it pinned to the bottom of the list across a height change, so the
    // message you were reading rises just above the keyboard (and doesn't get
    // "eaten"). Coords are content-relative, stable across the resize.
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
        document.body.style.height = "";
        prevH = 0;
        anchorBottom = null;
        return;
      }

      if (guard && focused) killScroll(); // Safari tab: pin doc scroll to 0
      let h = vv.height;
      // Safari tab: the instant the input is focused, shrink the panel to an
      // ESTIMATED post-keyboard height so the input is already above where the
      // keyboard will appear. Then Safari has no reason to scroll-to-reveal it,
      // so it never offsets the viewport (no creeping background, no jitter).
      // When the real keyboard height arrives we snap to it and remember it.
      if (guard && preShrink) {
        const realKb = baseH - vv.height;
        if (realKb > 80) {
          preShrink = false;
          cachedKb = realKb;
          h = vv.height;
        } else {
          h = baseH - (cachedKb || Math.round(baseH * 0.45));
        }
      }
      const top = vv.offsetTop; // SNAPPED — no easing, so no slow drift.
      const changed = Math.abs(h - prevH) > 1;
      if (changed && anchorBottom === null) anchorBottom = captureAnchor();

      // App-shell: <body> is owned by the lock (fixed, 100%) — don't touch its
      // height. Fixed-overlay path conforms body to the viewport.
      if (!appShell) document.body.style.height = `${h}px`;
      panel.style.height = `${h}px`;
      // Compensate Safari's visual-viewport offset on focus: it shifts the
      // visible area down by `offsetTop`, so without this the panel sits too
      // high (input ends up at the very top). On the relative app-shell panel
      // `top` nudges it back down into view; on the fixed overlay it IS the
      // viewport position. Snapped (no easing) — it's smooth now.
      panel.style.top = `${top}px`;

      if (changed && sc && anchorBottom !== null) {
        const msgH = Math.max(0, h - chromeH);
        const max = Math.max(0, contentH - msgH);
        sc.scrollTop = Math.min(Math.max(0, anchorBottom - msgH), max);
      }
      if (changed) releaseAnchorSoon();
      prevH = h;
    };

    // Short rAF pump to follow the keyboard animation on engines that don't emit
    // continuous viewport events (Safari). Self-stops when the window elapses.
    const loop = () => {
      apply();
      if (now() < loopUntil) requestAnimationFrame(loop);
      else looping = false;
    };
    const pump = (ms: number) => {
      loopUntil = Math.max(loopUntil, now() + ms);
      if (!looping) {
        looping = true;
        requestAnimationFrame(loop);
      }
    };

    // Blink/Gecko: continuous viewport events -> one rAF-batched apply per frame.
    const onEvent = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply();
        });
      }
    };
    // Safari tab only: snap the page back to 0 the instant Safari tries to
    // scroll it on focus (one frame late, hence a faint shimmer — but no fly).
    const onScroll = () => {
      if (guard && focused) killScroll();
    };
    const onFocusIn = () => {
      if (!isMobile()) return;
      focused = true;
      anchorBottom = captureAnchor();
      if (guard) {
        baseH = vv.height;
        preShrink = true;
        killScroll();
        apply(); // shrink synchronously, before Safari decides to scroll
      }
      pump(900); // cover the keyboard open animation
    };
    const onFocusOut = () => {
      if (!isMobile()) return;
      focused = false;
      preShrink = false;
      anchorBottom = captureAnchor();
      pump(700); // cover the keyboard close animation
    };

    apply();
    vv.addEventListener("resize", onEvent);
    vv.addEventListener("scroll", onEvent);
    window.addEventListener("resize", onEvent);
    if (guard) {
      window.addEventListener("scroll", onScroll, true);
      document.addEventListener("scroll", onScroll, true);
    }
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("focusout", onFocusOut);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (release) clearTimeout(release);
      loopUntil = 0;
      focused = false;
      vv.removeEventListener("resize", onEvent);
      vv.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("scroll", onScroll, true);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("focusout", onFocusOut);
      panel.style.height = "";
      panel.style.top = "";
      document.body.style.height = "";
    };
  }, [active, maxWidth, panelRef, scrollRef, appShell]);
}
