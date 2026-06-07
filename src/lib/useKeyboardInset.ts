"use client";

import { useEffect, useState } from "react";

// Tracks the VisualViewport so a fullscreen overlay can be pinned exactly to the
// visible area — the technique robust web apps use to stop the page "flying up"
// when the mobile keyboard opens.
//   vvh  = visible viewport height
//   top  = visible viewport offset from the layout viewport top (iOS scroll)
//   kb   = obscured pixels at the bottom (≈ keyboard height)
export function useKeyboardInset() {
  const [state, setState] = useState({ kb: 0, vvh: 0, top: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const kb = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        setState({ kb, vvh: vv.height, top: vv.offsetTop });
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    // Page scrolls (iOS keyboard) change offsetTop too.
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update, true);
    };
  }, []);

  return state;
}
