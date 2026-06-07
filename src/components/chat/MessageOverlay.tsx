"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Reply, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bubble, type ChatMsg } from "./ChatMessage";
import { REACTION_EMOJIS } from "./reactions";

const GAP = 8;
const MENU_H = 46;
const REPLY_H = 40;
const ANIM = 180; // exit duration (ms)

// Telegram-style focus overlay: blurs the whole pane, lifts the selected
// message above it, shows the reaction picker above and a reply action below.
export function MessageOverlay({
  message,
  mySide,
  isRead,
  anchor,
  container,
  canReply,
  canDelete,
  onReact,
  onReply,
  onDelete,
  onClose,
  onClosing,
}: {
  message: ChatMsg;
  mySide: "VISITOR" | "ADMIN";
  isRead: boolean;
  anchor: DOMRect;
  container: HTMLElement | null;
  canReply: boolean;
  canDelete: boolean;
  onReact: (id: string, emoji: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  // Fired the moment closing starts -> reveal the original under the fading
  // clone so there's no empty gap.
  onClosing?: () => void;
}) {
  const own = message.sender === mySide;
  const hasAction = canReply || canDelete;
  const [shiftY, setShiftY] = useState(0);
  const [cRect, setCRect] = useState<DOMRect | null>(null);
  const [show, setShow] = useState(false);

  // Enter on next frame; `show` drives the open/close transitions.
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Animate out, then actually unmount. Reveal the original immediately so the
  // fading clone overlaps it (no empty-gap flash).
  const close = (fn?: () => void) => {
    fn?.();
    onClosing?.();
    setShow(false);
    setTimeout(onClose, ANIM);
  };

  useLayoutEffect(() => {
    const c = container?.getBoundingClientRect() ?? null;
    setCRect(c);
    if (!c) return;
    let s = 0;
    const minTop = c.top + 10 + MENU_H + GAP;
    if (anchor.top + s < minTop) s = minTop - anchor.top;
    const maxBottom = c.bottom - 10 - (hasAction ? REPLY_H + GAP : 0);
    if (anchor.bottom + s > maxBottom) s -= anchor.bottom + s - maxBottom;
    if (anchor.top + s < minTop) s = minTop - anchor.top;
    setShiftY(s);
  }, [anchor, container, canReply]);

  const bubbleTop = anchor.top + shiftY;
  const sideStyle: React.CSSProperties = own
    ? { right: Math.max(8, window.innerWidth - anchor.right) }
    : { left: anchor.left };

  const pop = "transition-[opacity,transform] duration-150 ease-out";
  const popState = show ? "scale-100 opacity-100" : "scale-90 opacity-0";

  return (
    <>
      {/* Blur over the pane (also covers the input) */}
      <div
        onClick={() => close()}
        className={cn("fixed z-[190] bg-bg/40 backdrop-blur-[3px] transition-opacity duration-200", show ? "opacity-100" : "opacity-0")}
        style={
          cRect
            ? { top: cRect.top, left: cRect.left, width: cRect.width, height: cRect.height }
            : { inset: 0 }
        }
      />

      {/* Reaction picker above the message */}
      <div
        className={cn("fixed z-[201] flex gap-1 rounded-full border border-bg-border bg-bg-soft px-2 py-1.5 shadow-xl", pop, popState)}
        style={{ top: bubbleTop - GAP - MENU_H, transformOrigin: "bottom", ...sideStyle }}
      >
        {REACTION_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => close(() => onReact(message.id, e))}
            className="text-xl leading-none transition-transform hover:scale-125 active:scale-110"
          >
            {e}
          </button>
        ))}
      </div>

      {/* The lifted, crisp message */}
      <div
        className={cn("fixed z-[200] transition-[top,opacity,transform] duration-150 ease-out", show ? "opacity-100" : "opacity-0")}
        style={{ top: bubbleTop, left: anchor.left, width: anchor.width }}
      >
        <div className={cn("flex", own ? "justify-end" : "justify-start")}>
          <div className="max-w-full">
            <Bubble message={message} mySide={mySide} isRead={isRead} onReact={onReact} />
          </div>
        </div>
      </div>

      {/* Action below: reply (others) or delete (own) */}
      {hasAction ? (
        <button
          type="button"
          onClick={() => close(() => (canDelete ? onDelete(message.id) : onReply(message.id)))}
          className={cn(
            "fixed z-[201] flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-soft px-3 py-1.5 text-sm shadow-xl",
            pop,
            popState,
            canDelete ? "text-red-400" : "text-fg"
          )}
          style={{ top: anchor.bottom + shiftY + GAP, transformOrigin: "top", ...sideStyle }}
        >
          {canDelete ? (
            <>
              <Trash2 size={15} /> Удалить
            </>
          ) : (
            <>
              <Reply size={15} /> Ответить
            </>
          )}
        </button>
      ) : null}
    </>
  );
}
