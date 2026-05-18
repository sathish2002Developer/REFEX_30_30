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

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines =
    hero.typing_lines?.length > 0
      ? hero.typing_lines
      : ["Where every voice shapes the vision"];

  return (
    <section className="relative overflow-hidden border-b border-gray-200/80 min-h-[420px] md:min-h-[480px] lg:min-h-[520px]">
      <div className="absolute inset-0 z-0 bg-[#fafaf9]" aria-hidden>
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
            className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-amber-50 to-sky-100"
            aria-hidden
          />
        )}
      </div>

      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-white/50 via-white/28 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-r from-white/45 via-transparent to-white/20"
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
              <p className="text-xs font-sans text-gray-500 mt-10 flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin text-amber-600" aria-hidden />
                {cmsLoadingHint?.trim() || "Loading hero content…"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 animate-fade-in">
                <span className="inline-flex items-center gap-3 text-sky-800/90 text-xs font-sans tracking-[0.4em] uppercase font-medium">
                  <span className="w-8 h-px bg-sky-400/60" />
                  {hero.eyebrow}
                  <span className="w-8 h-px bg-sky-400/60" />
                </span>
              </div>

              <div className="min-h-[3.5rem] md:min-h-[4.5rem] mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 leading-tight drop-shadow-sm">
                  <TypeWriter
                    lines={lines}
                    typingSpeed={50}
                    deletingSpeed={25}
                    pauseTime={2500}
                  />
                </h1>
              </div>

              <div className="mb-5 w-16 h-px bg-gradient-to-r from-sky-400/80 via-sky-500/50 to-transparent" />

              <p
                className="text-base md:text-lg font-sans text-gray-600 max-w-xl mb-4 leading-relaxed animate-slide-up whitespace-pre-line drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
                style={{ animationDelay: "0.2s" }}
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
