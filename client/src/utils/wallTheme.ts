import type { CSSProperties } from "react";

export interface WallThemeCms {
  page_background: string;
  page_background_image_url: string;
  hero_background: string;
  hero_fallback_start: string;
  hero_fallback_mid: string;
  hero_fallback_end: string;
  hero_overlay_opacity_percent: number;
  accent: string;
  accent_dark: string;
  accent_light: string;
  eyebrow: string;
  headline: string;
  body_text: string;
  muted_text: string;
  card_background: string;
  card_border: string;
  card_hover_border: string;
  progress_ring: string;
}

export const DEFAULT_WALL_THEME: WallThemeCms = {
  page_background: "#f9fafb",
  page_background_image_url: "",
  hero_background: "#fafaf9",
  hero_fallback_start: "#ecfdf5",
  hero_fallback_mid: "#fffbeb",
  hero_fallback_end: "#e0f2fe",
  hero_overlay_opacity_percent: 50,
  accent: "#d97706",
  accent_dark: "#b45309",
  accent_light: "#fffbeb",
  eyebrow: "#075985",
  headline: "#111827",
  body_text: "#4b5563",
  muted_text: "#9ca3af",
  card_background: "#ffffff",
  card_border: "#e5e7eb",
  card_hover_border: "#fde68a",
  progress_ring: "#d4af37",
};

function normalizeHexOrCss(input: string, fallback: string): string {
  const s = (input || "").trim();
  if (!s) return fallback;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return s;
  if (/^(rgb|hsl)a?\(/i.test(s)) return s;
  return fallback;
}

export function mergeWallTheme(partial?: Partial<WallThemeCms> | null): WallThemeCms {
  const base = DEFAULT_WALL_THEME;
  if (!partial) return { ...base };
  const opacity = Math.min(
    100,
    Math.max(0, Number(partial.hero_overlay_opacity_percent ?? base.hero_overlay_opacity_percent))
  );
  return {
    page_background: normalizeHexOrCss(partial.page_background ?? "", base.page_background),
    page_background_image_url: String(partial.page_background_image_url ?? "").trim(),
    hero_background: normalizeHexOrCss(partial.hero_background ?? "", base.hero_background),
    hero_fallback_start: normalizeHexOrCss(
      partial.hero_fallback_start ?? "",
      base.hero_fallback_start
    ),
    hero_fallback_mid: normalizeHexOrCss(partial.hero_fallback_mid ?? "", base.hero_fallback_mid),
    hero_fallback_end: normalizeHexOrCss(partial.hero_fallback_end ?? "", base.hero_fallback_end),
    hero_overlay_opacity_percent: opacity,
    accent: normalizeHexOrCss(partial.accent ?? "", base.accent),
    accent_dark: normalizeHexOrCss(partial.accent_dark ?? "", base.accent_dark),
    accent_light: normalizeHexOrCss(partial.accent_light ?? "", base.accent_light),
    eyebrow: normalizeHexOrCss(partial.eyebrow ?? "", base.eyebrow),
    headline: normalizeHexOrCss(partial.headline ?? "", base.headline),
    body_text: normalizeHexOrCss(partial.body_text ?? "", base.body_text),
    muted_text: normalizeHexOrCss(partial.muted_text ?? "", base.muted_text),
    card_background: normalizeHexOrCss(partial.card_background ?? "", base.card_background),
    card_border: normalizeHexOrCss(partial.card_border ?? "", base.card_border),
    card_hover_border: normalizeHexOrCss(
      partial.card_hover_border ?? "",
      base.card_hover_border
    ),
    progress_ring: normalizeHexOrCss(partial.progress_ring ?? "", base.progress_ring),
  };
}

/** CSS custom properties for The Wall page (set on a root wrapper). */
export function wallThemeCssVars(theme: WallThemeCms): CSSProperties {
  const overlayAlpha = theme.hero_overlay_opacity_percent / 100;
  const pageBgImage = theme.page_background_image_url.trim();
  return {
    ["--wall-page-bg" as string]: theme.page_background,
    ["--wall-page-bg-image" as string]: pageBgImage ? `url("${pageBgImage}")` : "none",
    ["--wall-hero-bg" as string]: theme.hero_background,
    ["--wall-hero-fallback-start" as string]: theme.hero_fallback_start,
    ["--wall-hero-fallback-mid" as string]: theme.hero_fallback_mid,
    ["--wall-hero-fallback-end" as string]: theme.hero_fallback_end,
    ["--wall-hero-overlay" as string]: `rgba(255, 255, 255, ${overlayAlpha})`,
    ["--wall-hero-overlay-side" as string]: `rgba(255, 255, 255, ${Math.min(1, overlayAlpha * 0.9)})`,
    ["--wall-accent" as string]: theme.accent,
    ["--wall-accent-dark" as string]: theme.accent_dark,
    ["--wall-accent-light" as string]: theme.accent_light,
    ["--wall-eyebrow" as string]: theme.eyebrow,
    ["--wall-headline" as string]: theme.headline,
    ["--wall-body" as string]: theme.body_text,
    ["--wall-muted" as string]: theme.muted_text,
    ["--wall-card-bg" as string]: theme.card_background,
    ["--wall-card-border" as string]: theme.card_border,
    ["--wall-card-hover-border" as string]: theme.card_hover_border,
    ["--wall-progress-ring" as string]: theme.progress_ring,
  };
}
