import { useEffect, useState } from "react";
import TypeWriter from "../../../components/TypeWriter";
import type { WallHeroCms } from "../../../types/wallPageCms";

const DEFAULT_HERO_ART = "/images/wall-hero.svg";

interface WallHeaderProps {
  hero: WallHeroCms;
  /** True while `/api/cms/wall` is in flight — show skeleton over copy, keep layout stable. */
  cmsLoading?: boolean;
  /** Shown under skeleton (e.g. CMS “Loading the wall…” label). */
  cmsLoadingHint?: string;
}

function heroImageSrc(hero: WallHeroCms): string {
  const raw = (hero.hero_image_resolved_url || hero.hero_image_url || "").trim();
  if (!raw) return DEFAULT_HERO_ART;
  if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}

export default function WallHeader({
  hero,
  cmsLoading = false,
  cmsLoadingHint,
}: WallHeaderProps) {
  const [heroImgBroken, setHeroImgBroken] = useState(false);
  const imgSrc = heroImageSrc(hero);

  useEffect(() => {
    setHeroImgBroken(false);
  }, [imgSrc]);

  const lines =
    hero.typing_lines?.length > 0
      ? hero.typing_lines
      : ["Where every voice shapes the vision"];

  return (
    <section
      className="relative overflow-hidden border-b min-h-[420px] md:min-h-[480px] lg:min-h-[520px]"
      style={{ borderColor: "var(--wall-card-border, #e5e7eb)" }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: "var(--wall-hero-bg, #fafaf9)" }}
        aria-hidden
      >
        {!heroImgBroken ? (
          <img
            src={imgSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-fill object-center pointer-events-none"
            loading="eager"
            decoding="async"
            onError={() => setHeroImgBroken(true)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom right, var(--wall-hero-fallback-start, #ecfdf5), var(--wall-hero-fallback-mid, #fffbeb), var(--wall-hero-fallback-end, #e0f2fe))`,
            }}
            aria-hidden
          />
        )}
      </div>

      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: "linear-gradient(to bottom, var(--wall-hero-overlay), transparent)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(to right, var(--wall-hero-overlay-side), transparent, var(--wall-hero-overlay-side))",
        }}
        aria-hidden
      />

      <div className="relative z-10 pt-28 pb-14 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl">
          {cmsLoading ? (
            <div
              className="space-y-5"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="flex items-center gap-3 mb-5 animate-pulse">
                <span className="w-8 h-px bg-gray-300/90" />
                <div className="h-3.5 w-44 rounded-md bg-gray-300/80" />
                <span className="w-8 h-px bg-gray-300/90" />
              </div>
              <div className="min-h-[3.5rem] md:min-h-[4.5rem] mb-4 space-y-3 animate-pulse">
                <div className="h-9 md:h-10 lg:h-11 max-w-2xl rounded-lg bg-gray-300/75" />
                <div className="h-9 md:h-10 lg:h-11 max-w-xl rounded-lg bg-gray-200/80" />
              </div>
              <div className="mb-5 w-16 h-px bg-gray-300/90" />
              <div className="space-y-2 max-w-xl mb-4 animate-pulse">
                <div className="h-5 rounded-md bg-gray-200/85 w-full" />
                <div className="h-5 rounded-md bg-gray-200/85 w-[92%]" />
                <div className="h-5 rounded-md bg-gray-200/85 w-[70%]" />
              </div>
              <div className="h-3 w-36 rounded-md bg-gray-300/75 animate-pulse" />
              <p
                className="text-xs font-sans mt-10 flex items-center gap-2"
                style={{ color: "var(--wall-muted, #6b7280)" }}
              >
                <i
                  className="ri-loader-4-line animate-spin"
                  style={{ color: "var(--wall-accent, #d97706)" }}
                  aria-hidden
                />
                {cmsLoadingHint?.trim() || "Loading hero content…"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 animate-fade-in">
                <span
                  className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.4em] uppercase font-medium"
                  style={{ color: "var(--wall-eyebrow, #075985)" }}
                >
                  <span
                    className="w-8 h-px"
                    style={{ backgroundColor: "color-mix(in srgb, var(--wall-eyebrow) 60%, transparent)" }}
                  />
                  {hero.eyebrow}
                  <span
                    className="w-8 h-px"
                    style={{ backgroundColor: "color-mix(in srgb, var(--wall-eyebrow) 60%, transparent)" }}
                  />
                </span>
              </div>

              <div className="min-h-[3.5rem] md:min-h-[4.5rem] mb-4">
                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-serif leading-tight drop-shadow-sm"
                  style={{ color: "var(--wall-headline, #111827)" }}
                >
                  <TypeWriter
                    lines={lines}
                    typingSpeed={50}
                    deletingSpeed={25}
                    pauseTime={2500}
                  />
                </h1>
              </div>

              <div
                className="mb-5 w-16 h-px"
                style={{
                  background: `linear-gradient(to right, color-mix(in srgb, var(--wall-eyebrow) 80%, transparent), transparent)`,
                }}
              />

              <p
                className="text-base md:text-lg font-sans max-w-xl mb-4 leading-relaxed animate-slide-up whitespace-pre-line drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
                style={{ animationDelay: "0.2s", color: "var(--wall-body, #4b5563)" }}
              >
                {hero.intro}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
