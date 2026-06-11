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

    const now = () => performance.now();
    const isMobile = () => window.innerWidth <= maxWidth;

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

      const h = vv.height;
      const top = vv.offsetTop; // SNAPPED — no easing, so no slow drift.
      const changed = Math.abs(h - prevH) > 1;
      if (changed && anchorBottom === null) anchorBottom = captureAnchor();

      // Telegram-style: the locked document body conforms to the visual viewport
      // and the panel fills it. Only the height ever animates; top is ~0.
      document.body.style.height = `${h}px`;
      panel.style.height = `${h}px`;
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
    const onFocusIn = () => {
      if (!isMobile()) return;
      anchorBottom = captureAnchor();
      pump(900); // cover the keyboard open animation
    };
    const onFocusOut = () => {
      if (!isMobile()) return;
      anchorBottom = captureAnchor();
      pump(700); // cover the keyboard close animation
    };

    apply();
    vv.addEventListener("resize", onEvent);
    vv.addEventListener("scroll", onEvent);
    window.addEventListener("resize", onEvent);
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("focusout", onFocusOut);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (release) clearTimeout(release);
      loopUntil = 0;
      vv.removeEventListener("resize", onEvent);
      vv.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("focusout", onFocusOut);
      panel.style.height = "";
      panel.style.top = "";
      document.body.style.height = "";
    };
  }, [active, maxWidth, panelRef, scrollRef]);
}
