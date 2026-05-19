const path = require("path");
const { CmsWallPage } = require("../models");
const { responseStatus } = require("../helpers/response");
const { archiveCurrentRevision } = require("../helpers/cmsRevisionHelper");

/** Same-origin path only — browser loads from SPA host (dev proxy) instead of rewriting to API hostname. */
const DEFAULT_HERO_BG = "/images/wall-hero.svg";

function normalizeHeroImageUrl(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

function isPlainObject(o) {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}

function deepMerge(base, overlay) {
  if (!overlay) return base;
  const out = { ...base };
  for (const k of Object.keys(overlay)) {
    const bv = base[k];
    const ov = overlay[k];
    if (ov === undefined) continue;
    if (isPlainObject(bv) && isPlainObject(ov)) {
      out[k] = deepMerge(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}

function defaultPayload() {
  return {
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
    theme: {
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
    },
  };
}

function normalizeThemeColor(raw, fallback) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return fallback;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(s)) return s;
  if (/^(rgb|hsl)a?\(/i.test(s)) return s;
  return fallback;
}

function mergeTheme(defTheme, incomingTheme) {
  const base = { ...defTheme };
  if (!incomingTheme || typeof incomingTheme !== "object") return base;
  const out = { ...base };
  const colorKeys = [
    "page_background",
    "hero_background",
    "hero_fallback_start",
    "hero_fallback_mid",
    "hero_fallback_end",
    "accent",
    "accent_dark",
    "accent_light",
    "eyebrow",
    "headline",
    "body_text",
    "muted_text",
    "card_background",
    "card_border",
    "card_hover_border",
    "progress_ring",
  ];
  for (const k of colorKeys) {
    if (incomingTheme[k] !== undefined) {
      out[k] = normalizeThemeColor(incomingTheme[k], base[k]);
    }
  }
  if (incomingTheme.page_background_image_url !== undefined) {
    out.page_background_image_url = String(incomingTheme.page_background_image_url || "").trim();
  }
  if (incomingTheme.hero_overlay_opacity_percent !== undefined) {
    const n = parseInt(incomingTheme.hero_overlay_opacity_percent, 10);
    out.hero_overlay_opacity_percent = Math.min(100, Math.max(0, Number.isNaN(n) ? 50 : n));
  }
  return out;
}

function clampSize(n) {
  const x = parseInt(n, 10);
  if (Number.isNaN(x)) return 2;
  return Math.min(5, Math.max(1, x));
}

function mergePayload(dbPayload, incoming) {
  const def = defaultPayload();
  let next = deepMerge(def, dbPayload || {});
  next = deepMerge(next, incoming || {});

  if (incoming?.hero && Array.isArray(incoming.hero.typing_lines)) {
    next.hero.typing_lines = incoming.hero.typing_lines.map(String).filter(Boolean).slice(0, 12);
  }
  if (!next.hero.typing_lines?.length) next.hero.typing_lines = def.hero.typing_lines;

  if (incoming?.sidebar) {
    const sb = incoming.sidebar;
    if (Array.isArray(sb.word_cloud)) {
      next.sidebar.word_cloud = sb.word_cloud
        .filter((w) => w && w.word)
        .map((w) => ({ word: String(w.word).trim(), size: clampSize(w.size) }))
        .slice(0, 40);
    }
    if (Array.isArray(sb.daily_prompts)) {
      next.sidebar.daily_prompts = sb.daily_prompts.map(String).filter(Boolean).slice(0, 20);
    }
    if (Array.isArray(sb.vision_quotes)) {
      next.sidebar.vision_quotes = sb.vision_quotes
        .filter((q) => q && q.text)
        .map((q) => ({ text: String(q.text), author: String(q.author || "") }))
        .slice(0, 15);
    }
    if (Array.isArray(sb.top_contributors)) {
      next.sidebar.top_contributors = sb.top_contributors
        .filter((c) => c && c.name)
        .map((c) => ({
          name: String(c.name),
          role: String(c.role || ""),
          initials: String(c.initials || ""),
          posts: Math.max(0, parseInt(c.posts, 10) || 0),
          likes: Math.max(0, parseInt(c.likes, 10) || 0),
          streak: Math.max(0, parseInt(c.streak, 10) || 0),
        }))
        .slice(0, 12);
    }
    if (Array.isArray(sb.leader_preview_initials)) {
      next.sidebar.leader_preview_initials = sb.leader_preview_initials
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8);
    }
    if (sb.total_leaders_cap !== undefined) {
      next.sidebar.total_leaders_cap = Math.min(500, Math.max(1, parseInt(sb.total_leaders_cap, 10) || 43));
    }
  }

  if (!next.sidebar.word_cloud?.length) next.sidebar.word_cloud = def.sidebar.word_cloud;
  if (!next.sidebar.daily_prompts?.length) next.sidebar.daily_prompts = def.sidebar.daily_prompts;
  if (!next.sidebar.vision_quotes?.length) next.sidebar.vision_quotes = def.sidebar.vision_quotes;
  if (!next.sidebar.top_contributors?.length) next.sidebar.top_contributors = def.sidebar.top_contributors;
  if (!next.sidebar.leader_preview_initials?.length) {
    next.sidebar.leader_preview_initials = def.sidebar.leader_preview_initials;
  }

  next.theme = mergeTheme(def.theme, incoming?.theme || next.theme);

  return next;
}

function serializePayload(payload, _req) {
  const def = defaultPayload();
  const p = mergePayload(payload, {});
  let storedHero = (p.hero?.hero_image_url || DEFAULT_HERO_BG).trim();
  if (storedHero === "/images/wall-hero.png") storedHero = DEFAULT_HERO_BG;
  const heroPath = normalizeHeroImageUrl(storedHero) || DEFAULT_HERO_BG;
  return {
    hero: {
      ...p.hero,
      hero_image_url: storedHero,
      hero_image_resolved_url: heroPath,
    },
    labels: { ...def.labels, ...(p.labels || {}) },
    sidebar: p.sidebar,
    theme: mergeTheme(def.theme, p.theme),
  };
}

function pickUploaded(relPath) {
  if (!relPath) return "";
  return `/uploads/cms/${path.basename(relPath)}`;
}

async function getOrCreateRow() {
  let row = await CmsWallPage.findOne({ where: { singleton_key: "main" } });
  if (!row) {
    row = await CmsWallPage.create({
      singleton_key: "main",
      payload: defaultPayload(),
    });
  }
  return row;
}

const getPublicWallPage = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    const plain = row.get({ plain: true });
    const data = serializePayload(plain.payload || {}, req);
    return responseStatus(res, 200, "OK", data);
  } catch (e) {
    console.error("getPublicWallPage:", e);
    return responseStatus(res, 500, "Failed to load wall CMS");
  }
};

const patchAdminWallPage = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    let incoming = {};
    try {
      if (typeof req.body?.payload === "string" && req.body.payload.trim()) {
        incoming = JSON.parse(req.body.payload);
      } else if (req.body?.payload && typeof req.body.payload === "object") {
        incoming = req.body.payload;
      }
    } catch (parseErr) {
      console.error("patchAdminWallPage parse:", parseErr);
      return responseStatus(res, 400, "Invalid JSON payload");
    }

    if (req.file?.filename) {
      incoming = deepMerge(incoming, {
        hero: { hero_image_url: pickUploaded(req.file.path) },
      });
    }

    await archiveCurrentRevision("wall", req);
    row.payload = mergePayload(row.payload || {}, incoming);
    await row.save();

    const out = serializePayload(row.payload, req);
    return responseStatus(res, 200, "Saved", out);
  } catch (e) {
    console.error("patchAdminWallPage:", e);
    return responseStatus(res, 500, "Failed to save wall CMS");
  }
};

module.exports = {
  getPublicWallPage,
  patchAdminWallPage,
  defaultPayload,
  serializePayload,
};
