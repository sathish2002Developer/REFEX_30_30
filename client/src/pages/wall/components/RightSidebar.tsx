import { useState, useEffect } from "react";
import type {
  WallContributorRowCms,
  WallSidebarCms,
  WallWordItemCms,
} from "../../../types/wallPageCms";

function leaderNameForInitials(
  initials: string,
  contributors: WallContributorRowCms[]
): string {
  const key = initials.trim().toUpperCase();
  const match = contributors.find((c) => c.initials.trim().toUpperCase() === key);
  return match?.name?.trim() || initials;
}

function liveTrendToCloudShapes(
  rows: { word: string; count: number }[]
): WallWordItemCms[] {
  const valid = rows
    .filter((r) => r && typeof r.word === "string" && String(r.word).trim())
    .map((r) => ({
      word: String(r.word).trim(),
      count: Math.max(1, Math.floor(Number(r.count)) || 1),
    }));
  if (!valid.length) return [];
  const slice = valid.slice(0, 36);
  const counts = slice.map((r) => r.count);
  const minC = Math.min(...counts);
  const maxC = Math.max(...counts);
  const span = Math.max(1e-9, maxC - minC);
  return slice.map(({ word, count }) => {
    const t = (count - minC) / span;
    const size = Math.min(5, Math.max(1, Math.round(1 + t * 4)));
    return { word, size };
  });
}

interface RightSidebarProps {
  cms: WallSidebarCms;
  activeCount: number;
  /** Live trending from wall posts (`GET /api/wall/stats`) — never uses CMS static word list. */
  liveWordTrend: { word: string; count: number }[];
  trendingLoading?: boolean;
}

export default function RightSidebar({
  cms,
  activeCount,
  liveWordTrend,
  trendingLoading = false,
}: RightSidebarProps) {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [leadersHover, setLeadersHover] = useState(false);

  const prompts = cms.daily_prompts.length ? cms.daily_prompts : [""];
  const quotes = cms.vision_quotes.length ? cms.vision_quotes : [{ text: "", author: "" }];
  const wordCloud = liveTrendToCloudShapes(liveWordTrend);
  const trendCountByWord = new Map(
    liveWordTrend.map((row) => [row.word.trim().toLowerCase(), row.count])
  );
  const contributors = cms.top_contributors.length ? cms.top_contributors : [];
  const previewInitials = cms.leader_preview_initials.slice(0, 5);
  const totalLeaders = Math.max(1, cms.total_leaders_cap || 43);

  useEffect(() => {
    let start = 0;
    const end = activeCount;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedCount(end);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [activeCount]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const quoteTimer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(quoteTimer);
  }, [quotes.length]);

  useEffect(() => {
    if (prompts.length <= 1) return;
    const promptTimer = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
    }, 30_000);
    return () => clearInterval(promptTimer);
  }, [prompts.length]);

  const refreshPrompt = () => {
    if (prompts.length <= 1) return;
    setCurrentPrompt((prev) => (prev + 1) % prompts.length);
  };

  const progress = (animatedCount / totalLeaders) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const plusExtra = Math.max(0, animatedCount - previewInitials.length);
  const previewLeaders = previewInitials.map((ini) => ({
    initials: ini,
    name: leaderNameForInitials(ini, contributors),
  }));

  return (
    <div className="space-y-5 lg:w-80 shrink-0">
      <div
        className="wall-panel rounded-xl p-6 shadow-sm"
        onMouseEnter={() => setLeadersHover(true)}
        onMouseLeave={() => setLeadersHover(false)}
      >
        <div className="text-[10px] font-sans wall-muted-text tracking-widest uppercase mb-4">
          {cms.active_leaders_title}
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#E5E7EB" strokeWidth="4" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="var(--wall-progress-ring, #D4AF37)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-serif wall-accent-text">{animatedCount}</span>
              {/* <span className="text-[10px] font-sans wall-muted-text">of {totalLeaders}</span> */}
            </div>
          </div>
        </div>
        <div className="text-center mt-3 min-h-[2.5rem] px-1 flex items-center justify-center">
          <p
            className={`text-xs font-sans leading-relaxed transition-colors duration-200 ${
              leadersHover && previewLeaders.length > 0 ? "wall-body-text" : "wall-muted-text"
            }`}
          >
            {leadersHover && previewLeaders.length > 0
              ? previewLeaders.map((l) => l.name).join(" · ")
              : cms.active_leaders_sub}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          {previewLeaders.map((leader, i) => (
            <div
              key={`${leader.initials}-${i}`}
              className="relative group"
              title={leader.name}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-semibold wall-accent-text cursor-default ring-2 ring-transparent group-hover:ring-amber-400/50 transition-all"
                style={{
                  backgroundColor: "var(--wall-accent-light, #fffbeb)",
                  border: "1px solid var(--wall-card-hover-border, #fde68a)",
                }}
              >
                {leader.initials}
              </div>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-sans font-medium whitespace-nowrap rounded-md bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 shadow-md"
              >
                {leader.name}
              </span>
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] text-gray-500">
            +{plusExtra}
          </div>
        </div>
      </div>

      <div className="wall-panel rounded-xl p-6 shadow-sm">
        <div className="text-[10px] font-sans wall-muted-text tracking-widest uppercase mb-4">
          {cms.trending_title}
        </div>
        {trendingLoading ? (
          <p className="text-xs font-sans wall-muted-text">Loading trending words…</p>
        ) : wordCloud.length === 0 ? (
          <p className="text-xs font-sans wall-muted-text leading-relaxed">
            No trending words yet. Words come from posts on the wall — create a post with a
            &quot;One word&quot; tag to appear here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wordCloud.map((w, i) => (
              <span
                key={`${w.word}-${i}`}
                title={`${w.word} (${trendCountByWord.get(w.word.trim().toLowerCase()) ?? 0} posts)`}
                className={`font-sans wall-accent-text cursor-default transition-all duration-300 hover:scale-105 hover:opacity-80 ${
                  w.size === 1
                    ? "text-[10px]"
                    : w.size === 2
                      ? "text-xs"
                      : w.size === 3
                        ? "text-sm"
                        : w.size === 4
                          ? "text-base font-medium"
                          : "text-lg font-semibold"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {w.word}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="wall-panel rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl"
          style={{ backgroundColor: "var(--wall-accent-light, #fffbeb)" }}
        />
        <div className="text-[10px] font-sans text-gray-400 tracking-widest uppercase mb-3">
          {cms.daily_reflection_title}
        </div>
        <div className="relative">
          <i
            className="ri-double-quotes-l text-lg absolute -top-1 -left-1 wall-accent-text"
            style={{ opacity: 0.35 }}
          ></i>
          <p className="text-sm font-serif wall-body-text italic leading-relaxed pl-4">
            {prompts[currentPrompt] ?? ""}
          </p>
        </div>
        {/* {prompts.length > 1 && (
          <button
            type="button"
            onClick={refreshPrompt}
            className="mt-4 flex items-center gap-2 text-xs font-sans wall-accent-text transition-colors cursor-pointer"
          >
            <i className="ri-refresh-line"></i>
            <span>{cms.new_prompt_label}</span>
          </button>
        )} */}
      </div>

    

      <div className="wall-panel rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl"
          style={{ backgroundColor: "var(--wall-accent-light, #fffbeb)" }}
        />
        <div className="text-[10px] font-sans wall-muted-text tracking-widest uppercase mb-4">
          {cms.vision_quote_title}
        </div>
        <div className="relative min-h-[80px]">
          <i
            className="ri-double-quotes-l text-2xl absolute -top-2 -left-1 wall-accent-text"
            style={{ opacity: 0.25 }}
          ></i>
          <p className="text-sm font-serif wall-body-text italic leading-relaxed pl-4 transition-opacity duration-700">
            {quotes[currentQuote]?.text}
          </p>
          {/* <p className="text-[10px] font-sans wall-accent-text mt-3 pl-4 tracking-wide">
            — {quotes[currentQuote]?.author}
          </p> */}
        </div>
        {/* {quotes.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {quotes.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentQuote(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentQuote ? "w-4" : "bg-gray-200 hover:bg-gray-400"
                }`}
                style={
                  i === currentQuote
                    ? { backgroundColor: "var(--wall-accent, #d97706)" }
                    : undefined
                }
              />
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
