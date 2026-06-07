"use client";

import { useEffect } from "react";

// Locks page scroll behind a fullscreen mobile overlay (chat). Uses the
// iOS-safe `position: fixed` technique so focusing an input can't scroll the
// page underneath. Only engages on small screens (<= maxWidth).
export function useBodyScrollLock(active: boolean, maxWidth = 1024) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (window.innerWidth > maxWidth) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    // Lock the document element too — body position:fixed alone does NOT stop
    // iOS Safari from scrolling the page on input focus.
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active, maxWidth]);
}
