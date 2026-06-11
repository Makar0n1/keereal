"use client";

import { useEffect } from "react";

// Locks page scroll behind a fullscreen mobile overlay (chat). Telegram-Web
// recipe: BOTH <html> and <body> get `position: fixed` so the document is
// genuinely non-scrollable — body alone does NOT stop iOS Safari (in a browser
// tab) from scrolling the page / offsetting the visual viewport on input focus,
// which is what made the chat "fly / jitter" there. Only engages on small
// screens (<= maxWidth).
export function useBodyScrollLock(active: boolean, maxWidth = 1024) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (window.innerWidth > maxWidth) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const prev = {
      bPosition: body.style.position,
      bTop: body.style.top,
      bLeft: body.style.left,
      bRight: body.style.right,
      bWidth: body.style.width,
      bHeight: body.style.height,
      bOverflow: body.style.overflow,
      hPosition: html.style.position,
      hTop: html.style.top,
      hLeft: html.style.left,
      hRight: html.style.right,
      hWidth: html.style.width,
      hHeight: html.style.height,
      hOverflow: html.style.overflow,
      hOverscroll: html.style.overscrollBehavior,
    };

    // <html>: fully pinned to the viewport — nothing for Safari to scroll.
    html.style.position = "fixed";
    html.style.top = "0";
    html.style.left = "0";
    html.style.right = "0";
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    // <body>: also fixed, offset by the current scroll so the page underneath
    // keeps its visual position while locked.
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.bPosition;
      body.style.top = prev.bTop;
      body.style.left = prev.bLeft;
      body.style.right = prev.bRight;
      body.style.width = prev.bWidth;
      body.style.height = prev.bHeight;
      body.style.overflow = prev.bOverflow;
      html.style.position = prev.hPosition;
      html.style.top = prev.hTop;
      html.style.left = prev.hLeft;
      html.style.right = prev.hRight;
      html.style.width = prev.hWidth;
      html.style.height = prev.hHeight;
      html.style.overflow = prev.hOverflow;
      html.style.overscrollBehavior = prev.hOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active, maxWidth]);
}
