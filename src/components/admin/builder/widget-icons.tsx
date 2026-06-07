"use client";

import {
  LayoutTemplate,
  Type,
  Scale,
  Images,
  Monitor,
  BarChart3,
  Cpu,
  Network,
  Film,
  Quote,
  Milestone,
  Target,
  Minus,
  Square,
  type LucideIcon,
} from "lucide-react";

// Maps a widget type to a consistent 2D line icon (no emoji).
const WIDGET_ICONS: Record<string, LucideIcon> = {
  "hero-case": LayoutTemplate,
  text: Type,
  "problem-solution": Scale,
  gallery: Images,
  showcase: Monitor,
  metrics: BarChart3,
  "tech-stack": Cpu,
  "arch-diagram": Network,
  media: Film,
  quote: Quote,
  timeline: Milestone,
  cta: Target,
  spacer: Minus,
};

export function WidgetIcon({ type, className }: { type: string; className?: string }) {
  const Icon = WIDGET_ICONS[type] ?? Square;
  return <Icon className={className} strokeWidth={1.75} />;
}
