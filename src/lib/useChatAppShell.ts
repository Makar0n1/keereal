"use client";

import { useEffect, useState, type RefObject } from "react";

// Shared mobile chat keyboard handling (extracted from the guest ChatWidget,
// see CLAUDE.md §6.5e). While the conversation is open on mobile it:
//  - locks the document to window.visualViewport.height (the only value that
//    always equals the truly visible area) and html position:fixed on iOS, so
//    the composer never hides under browser chrome / the keyboard;
//  - sizes the pane to the same height;
//  - blocks touchmove outside the message list (only the list scrolls, with a
//    contained springy bounce);
//  - positions a sticky header at the visible-viewport top;
//  - tracks the keyboard (kbUp) and exposes per-browser bottom-inset classes
//    (their bottom chrome overlaps the content differently — heuristics tuned
//    on device).
export function useChatAppShell(
  active: boolean,
  paneRef: RefObject<HTMLElement | null>,
  stickyHeaderRef: RefObject<HTMLElement | null>,
  maxWidth = 639
) {
  const [isMobile, setIsMobile] = useState(false);
  const [bottomPad, setBottomPad] = useState("pb-3");
  const [kbUpPad, setKbUpPad] = useState("pb-3");
  const [isFirefox, setIsFirefox] = useState(false);
  const [kbUp, setKbUp] = useState(false);
  const [stickyShow, setStickyShow] = useState(false);

  // Mobile breakpoint + per-browser inset classes.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= maxWidth);
    check();
    const ua = navigator.userAgent;
    const crios = /crios/i.test(ua);
    const firefox = /fxios|firefox/i.test(ua);
    const safari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
    setBottomPad(crios ? "pb-32" : safari ? "pb-12" : "pb-3");
    setKbUpPad(safari ? "pb-12" : crios ? "pb-[7.5rem]" : "pb-3");
    setIsFirefox(firefox);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [maxWidth]);

  // Document lock + viewport-height tracking.
  useEffect(() => {
    if (!active || !isMobile) return;
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const pane = paneRef.current;
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const save = (el: HTMLElement) => ({
      position: el.style.position,
      top: el.style.top,
      left: el.style.left,
      right: el.style.right,
      width: el.style.width,
      height: el.style.height,
      overflow: el.style.overflow,
      margin: el.style.margin,
    });
    const prevHtml = save(html);
    const prevBody = save(body);

    const vv = window.visualViewport;
    let raf = 0;
    const setH = () => {
      const h = `${vv ? vv.height : window.innerHeight}px`;
      html.style.height = h;
      body.style.height = h;
      if (pane) pane.style.height = h;
      if (stickyHeaderRef.current) {
        stickyHeaderRef.current.style.top = `${vv ? vv.offsetTop : 0}px`;
      }
    };
    const onVV = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setH();
      });
    };
    if (isIOS) html.style.position = "fixed";
    html.style.top = "0";
    html.style.left = "0";
    html.style.right = "0";
    html.style.width = "100%";
    body.style.width = "100%";
    html.style.margin = "0";
    body.style.margin = "0";
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    const onTouchMove = (e: TouchEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest(".chat-scroll, [data-chat-lightbox]")) return;
      if (e.cancelable) e.preventDefault();
    };
    setH();
    vv?.addEventListener("resize", onVV);
    vv?.addEventListener("scroll", onVV);
    window.addEventListener("resize", onVV);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", onVV);
      vv?.removeEventListener("scroll", onVV);
      window.removeEventListener("resize", onVV);
      document.removeEventListener("touchmove", onTouchMove);
      const restore = (el: HTMLElement, p: ReturnType<typeof save>) => {
        el.style.position = p.position;
        el.style.top = p.top;
        el.style.left = p.left;
        el.style.right = p.right;
        el.style.width = p.width;
        el.style.height = p.height;
        el.style.overflow = p.overflow;
        el.style.margin = p.margin;
        el.style.overscrollBehavior = "";
      };
      restore(html, prevHtml);
      restore(body, prevBody);
      if (pane) pane.style.height = "";
      window.scrollTo(0, scrollY);
    };
  }, [active, isMobile, paneRef, stickyHeaderRef]);

  // Keyboard up? (focus tracking) + delayed sticky-header reveal.
  useEffect(() => {
    if (!active || !isMobile) {
      setKbUp(false);
      setStickyShow(false);
      return;
    }
    const pane = paneRef.current;
    if (!pane) return;
    let t: ReturnType<typeof setTimeout>;
    const onFocusIn = () => {
      setKbUp(true);
      clearTimeout(t);
      t = setTimeout(() => setStickyShow(true), 320);
    };
    const onFocusOut = () => {
      setKbUp(false);
      clearTimeout(t);
      setStickyShow(false);
    };
    pane.addEventListener("focusin", onFocusIn);
    pane.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(t);
      pane.removeEventListener("focusin", onFocusIn);
      pane.removeEventListener("focusout", onFocusOut);
    };
  }, [active, isMobile, paneRef]);

  return { isMobile, bottomPad, kbUpPad, kbUp, stickyShow, isFirefox };
}
