"use client";

import { useEffect } from "react";
import Image from "next/image";

export interface LightboxImage {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

// Controlled lightbox overlay. The parent (a client component) owns the open
// index and renders this as an element child — no render props across the
// server/client boundary.
export function LightboxModal({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index! + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index! - 1 + images.length) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, index, images.length, onClose, onIndex]);

  if (index === null) return null;
  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 text-2xl text-white/70 hover:text-white"
        aria-label="Закрыть"
        onClick={onClose}
      >
        ×
      </button>
      <div className="relative max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={current.url}
          alt={current.alt}
          width={current.width ?? 1600}
          height={current.height ?? 1000}
          className="max-h-[85vh] w-auto rounded-lg object-contain"
          sizes="90vw"
        />
        {current.caption ? (
          <p className="mt-3 text-center text-sm text-white/60">{current.caption}</p>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 text-sm text-white/60" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onIndex((index - 1 + images.length) % images.length)} className="hover:text-white">
            ← Назад
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
          <button onClick={() => onIndex((index + 1) % images.length)} className="hover:text-white">
            Вперёд →
          </button>
        </div>
      ) : null}
    </div>
  );
}
