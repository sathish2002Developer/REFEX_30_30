export interface WallHeroCms {
  eyebrow: string;
  typing_lines: string[];
  intro: string;
  hero_image_url: string;
  hero_image_resolved_url?: string;
}

export interface WallFeedLabelsCms {
  sign_in_hint: string;
  loading_the_wall: string;
  post_count_loading: string;
  post_count_suffix: string;
  empty_state: string;
  refresh_posts: string;
}

export interface WallWordItemCms {
  word: string;
  size: number;
}

export interface WallContributorRowCms {
  name: string;
  role: string;
  initials: string;
  posts: number;
  likes: number;
  streak: number;
}

export interface WallVisionQuoteRowCms {
  text: string;
  author: string;
}

export interface WallSidebarCms {
  active_leaders_title: string;
  active_leaders_sub: string;
  total_leaders_cap: number;
  leader_preview_initials: string[];
  trending_title: string;
  daily_reflection_title: string;
  new_prompt_label: string;
  top_contributors_title: string;
  likes_word: string;
  vision_quote_title: string;
  word_cloud: WallWordItemCms[];
  daily_prompts: string[];
  vision_quotes: WallVisionQuoteRowCms[];
  top_contributors: WallContributorRowCms[];
}

export interface WallPageCms {
  hero: WallHeroCms;
  labels: WallFeedLabelsCms;
  sidebar: WallSidebarCms;
}

const DEFAULT_HERO_BG = "/images/wall-hero.svg";

export const DEFAULT_WALL_PAGE_CMS: WallPageCms = {
  hero: {
    eyebrow: "The Refex 2030 Wall",
    typing_lines: [
      "Where every voice shapes the vision",
      "Leadership begins with reflection",
      "Share your story. Inspire change.",
      "The Wall is alive — write on it.",
    ],
    intro:
      "A living journal for the Refex 2030 leadership journey.\nWrite, sketch, share — freely and often.",
    hero_image_url: DEFAULT_HERO_BG,
    hero_image_resolved_url: DEFAULT_HERO_BG,
  },
  labels: {
    sign_in_hint: "Sign in with your Refex email when you post",
    loading_the_wall: "Loading the wall...",
    post_count_loading: "Loading...",
    post_count_suffix: "posts",
    empty_state: "No posts yet — be the first to write on the wall",
    refresh_posts: "Refresh posts",
  },
  sidebar: {
    active_leaders_title: "Active Leaders",
    active_leaders_sub: "leaders active today",
    total_leaders_cap: 43,
    leader_preview_initials: ["AK", "PR", "SR", "VK", "MN"],
    trending_title: "Trending Words",
    daily_reflection_title: "Daily Reflection",
    new_prompt_label: "New prompt",
    top_contributors_title: "Top Contributors",
    likes_word: "likes",
    vision_quote_title: "Vision Quote",
    word_cloud: [
      { word: "Bold", size: 2 },
      { word: "Legacy", size: 3 },
      { word: "Unstoppable", size: 2 },
      { word: "Historic", size: 3 },
      { word: "Belief", size: 4 },
      { word: "Scale", size: 4 },
      { word: "Courage", size: 3 },
      { word: "Purpose", size: 5 },
      { word: "Together", size: 4 },
      { word: "Audacious", size: 5 },
      { word: "Dream", size: 5 },
      { word: "Build", size: 4 },
      { word: "Now", size: 5 },
      { word: "Transform", size: 3 },
      { word: "Future", size: 4 },
      { word: "Impact", size: 3 },
      { word: "Trust", size: 4 },
      { word: "Vision", size: 5 },
      { word: "Grit", size: 3 },
      { word: "Pivot", size: 2 },
      { word: "Resilience", size: 3 },
      { word: "Align", size: 4 },
    ],
    daily_prompts: [
      "What belief are you challenging today?",
      "What would you attempt if you knew you could not fail?",
      "Which strength of Refex are we underutilising?",
      "What does 'generational enterprise' mean to you personally?",
      "Who on this wall inspires you most this week?",
      "What's one audacious move we should make this quarter?",
      "If Refex was a person, what would their defining trait be?",
    ],
    vision_quotes: [
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
      { text: "Vision without action is merely a dream.", author: "Joel Barker" },
      { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
      },
    ],
    top_contributors: [
      { name: "Meera N.", role: "Head of Mobility", initials: "MN", posts: 12, likes: 156, streak: 5 },
      { name: "Priya R.", role: "CFO", initials: "PR", posts: 10, likes: 142, streak: 4 },
      { name: "Vikram K.", role: "CTO", initials: "VK", posts: 9, likes: 128, streak: 4 },
      { name: "Anil K.", role: "CEO, Energy", initials: "AK", posts: 8, likes: 134, streak: 3 },
      { name: "Deepa M.", role: "Life Sciences", initials: "DM", posts: 7, likes: 98, streak: 3 },
    ],
  },
};

export function mergeWallPageFromApi(data: Partial<WallPageCms> | null): WallPageCms {
  if (!data) return DEFAULT_WALL_PAGE_CMS;
  const base = DEFAULT_WALL_PAGE_CMS;
  return {
    hero: {
      ...base.hero,
      ...data.hero,
      typing_lines:
        Array.isArray(data.hero?.typing_lines) && data.hero!.typing_lines.length > 0
          ? data.hero!.typing_lines.map(String)
          : base.hero.typing_lines,
      hero_image_resolved_url:
        data.hero?.hero_image_resolved_url ||
        data.hero?.hero_image_url ||
        base.hero.hero_image_resolved_url,
    },
    labels: { ...base.labels, ...data.labels },
    sidebar: {
      ...base.sidebar,
      ...data.sidebar,
      word_cloud:
        Array.isArray(data.sidebar?.word_cloud) && data.sidebar!.word_cloud.length > 0
          ? data.sidebar!.word_cloud
          : base.sidebar.word_cloud,
      daily_prompts:
        Array.isArray(data.sidebar?.daily_prompts) && data.sidebar!.daily_prompts.length > 0
          ? data.sidebar!.daily_prompts.map(String)
          : base.sidebar.daily_prompts,
      vision_quotes:
        Array.isArray(data.sidebar?.vision_quotes) && data.sidebar!.vision_quotes.length > 0
          ? data.sidebar!.vision_quotes.map((q) => ({
              text: String(q.text || ""),
              author: String(q.author || ""),
            }))
          : base.sidebar.vision_quotes,
      top_contributors:
        Array.isArray(data.sidebar?.top_contributors) && data.sidebar!.top_contributors.length > 0
          ? data.sidebar!.top_contributors.map((c) => ({
              name: String(c.name || ""),
              role: String(c.role || ""),
              initials: String(c.initials || ""),
              posts: Number(c.posts) || 0,
              likes: Number(c.likes) || 0,
              streak: Number(c.streak) || 0,
            }))
          : base.sidebar.top_contributors,
      leader_preview_initials:
        Array.isArray(data.sidebar?.leader_preview_initials) &&
        data.sidebar!.leader_preview_initials.length > 0
          ? data.sidebar!.leader_preview_initials.map(String)
          : base.sidebar.leader_preview_initials,
      total_leaders_cap: Math.min(
        500,
        Math.max(1, Number(data.sidebar?.total_leaders_cap) || base.sidebar.total_leaders_cap)
      ),
    },
  };
}

export function wallPageCmsToPayload(w: WallPageCms): WallPageCms {
  const { hero_image_resolved_url: _h, ...hero } = w.hero;
  return {
    hero,
    labels: w.labels,
    sidebar: w.sidebar,
  };
}
