const path = require("path");
const { CmsHomeHero } = require("../models");
const { responseStatus } = require("../helpers/response");
const { archiveCurrentRevision } = require("../helpers/cmsRevisionHelper");

const DEFAULT_BG =
  "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/15181ef8-7c35-4bb8-b0ba-6d5eb33b5694_Home.jpg?v=834bb40ea63c5255d57a7b7d74094acb";

function defaultPageExtras() {
  return {
    marquee_phrases: [
      "Dream Together",
      "Think Audaciously",
      "Build as One",
      "USD 30 Billion by 2030",
      "Refex 30 by 30",
    ],
    cta_section: {
      eyebrow: "Your Turn",
      title_plain: "Make your personal ",
      title_emphasis: "leadership commitment",
      title_after: " to Refex 2030",
      body:
        "Reflect on the journey ahead. Declare your role in it. Sign your commitment to building something generational — together.",
      button_label: "Go to The Wall",
      button_href: "/wall",
    },
  };
}

function mergedPageExtras(plain) {
  const def = defaultPageExtras();
  const raw =
    plain.page_extras && typeof plain.page_extras === "object" ? plain.page_extras : {};
  const phrases = Array.isArray(raw.marquee_phrases)
    ? raw.marquee_phrases.map(String).filter((s) => s.trim())
    : [];
  const ctaIn = raw.cta_section && typeof raw.cta_section === "object" ? raw.cta_section : {};
  return {
    marquee_phrases: phrases.length ? phrases : def.marquee_phrases,
    cta_section: {
      ...def.cta_section,
      ...Object.fromEntries(
        Object.keys(def.cta_section).map((k) => [
          k,
          ctaIn[k] !== undefined && ctaIn[k] !== null ? String(ctaIn[k]) : def.cta_section[k],
        ])
      ),
    },
  };
}

function defaultHeroValues() {
  return {
    top_label: "Refex Group · Leadership Vision · May 22–23, 2026",
    title_left: "30",
    title_middle: "BY",
    title_right: "30",
    tagline_plain: "A Vision to Build a",
    tagline_emphasis: "Generational Enterprise",
    subtitle_upper: "USD 30 Billion by 2030 · Refex Group Leadership Vision",
    quote_text:
      "This is not an offsite. This is a defining leadership moment for Refex Group.",
    hashtags: ["#DreamBig", "#BuildTogether", "#30By30", "#ThinkAudaciously"],
    ctas: [
      { label: "Record My Commitment", href: "/wall", variant: "primary" },
      { label: "Explore the Vision", href: "/vision", variant: "outline" },
    ],
    background_image_url: DEFAULT_BG,
    overlay_opacity: 40,
    radial_glow_enabled: true,
    radial_glow_strength_percent: 12,
    particles_enabled: true,
    particle_canvas_opacity_percent: 70,
    floating_orbs_enabled: true,
    rings_enabled: true,
    ring_rotate_seconds: 40,
    ring_reverse_seconds: 30,
    corner_decorations_enabled: true,
    stagger_animations_enabled: true,
    scroll_indicator_enabled: true,
    page_extras: defaultPageExtras(),
  };
}

function serializeRow(row, req) {
  const plain = row.get({ plain: true });
  const bg = plain.background_image_url || DEFAULT_BG;
  const extras = mergedPageExtras(plain);
  return {
    id: plain.id,
    top_label: plain.top_label ?? "",
    title_left: plain.title_left ?? "30",
    title_middle: plain.title_middle ?? "BY",
    title_right: plain.title_right ?? "30",
    tagline_plain: plain.tagline_plain ?? "",
    tagline_emphasis: plain.tagline_emphasis ?? "",
    subtitle_upper: plain.subtitle_upper ?? "",
    quote_text: plain.quote_text ?? "",
    hashtags: Array.isArray(plain.hashtags) ? plain.hashtags : [],
    ctas: Array.isArray(plain.ctas) ? plain.ctas : [],
    background_image_url: bg,
    background_image_resolved_url: bg.startsWith("http")
      ? bg
      : `${req.protocol}://${req.get("host")}${bg.startsWith("/") ? bg : "/" + bg}`,
    overlay_opacity: Number(plain.overlay_opacity ?? 40),
    radial_glow_enabled: Boolean(plain.radial_glow_enabled),
    radial_glow_strength_percent: Number(plain.radial_glow_strength_percent ?? 12),
    particles_enabled: Boolean(plain.particles_enabled),
    particle_canvas_opacity_percent: Number(plain.particle_canvas_opacity_percent ?? 70),
    floating_orbs_enabled: Boolean(plain.floating_orbs_enabled),
    rings_enabled: Boolean(plain.rings_enabled),
    ring_rotate_seconds: Number(plain.ring_rotate_seconds ?? 40),
    ring_reverse_seconds: Number(plain.ring_reverse_seconds ?? 30),
    corner_decorations_enabled: Boolean(plain.corner_decorations_enabled),
    stagger_animations_enabled: Boolean(plain.stagger_animations_enabled),
    scroll_indicator_enabled: Boolean(plain.scroll_indicator_enabled),
    marquee_phrases: extras.marquee_phrases,
    cta_section: extras.cta_section,
    updated_at: plain.updated_at,
  };
}

async function getOrCreateRow() {
  let row = await CmsHomeHero.findOne({ where: { singleton_key: "home" } });
  if (!row) {
    row = await CmsHomeHero.create({
      singleton_key: "home",
      ...defaultHeroValues(),
    });
  }
  return row;
}

const getPublicHomeHero = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    return responseStatus(res, 200, "OK", serializeRow(row, req));
  } catch (e) {
    console.error("getPublicHomeHero:", e);
    return responseStatus(res, 500, "Failed to load hero CMS");
  }
};

const patchAdminHomeHero = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    await archiveCurrentRevision("home-hero", req);
    const body = req.body || {};

    [
      "top_label",
      "title_left",
      "title_middle",
      "title_right",
      "tagline_plain",
      "tagline_emphasis",
      "subtitle_upper",
      "quote_text",
    ].forEach((k) => {
      if (body[k] !== undefined) row[k] = String(body[k]);
    });

    if (body.overlay_opacity !== undefined) {
      row.overlay_opacity = Math.min(100, Math.max(0, parseInt(body.overlay_opacity, 10) || 0));
    }
    if (body.radial_glow_strength_percent !== undefined) {
      row.radial_glow_strength_percent = Math.min(
        100,
        Math.max(0, parseInt(body.radial_glow_strength_percent, 10) || 0)
      );
    }
    if (body.particle_canvas_opacity_percent !== undefined) {
      row.particle_canvas_opacity_percent = Math.min(
        100,
        Math.max(0, parseInt(body.particle_canvas_opacity_percent, 10) || 0)
      );
    }
    if (body.ring_rotate_seconds !== undefined) {
      row.ring_rotate_seconds = Math.min(120, Math.max(10, parseInt(body.ring_rotate_seconds, 10) || 40));
    }
    if (body.ring_reverse_seconds !== undefined) {
      row.ring_reverse_seconds = Math.min(120, Math.max(10, parseInt(body.ring_reverse_seconds, 10) || 30));
    }

    [
      "radial_glow_enabled",
      "particles_enabled",
      "floating_orbs_enabled",
      "rings_enabled",
      "corner_decorations_enabled",
      "stagger_animations_enabled",
      "scroll_indicator_enabled",
    ].forEach((k) => {
      if (body[k] === undefined) return;
      const v = body[k];
      row[k] = v === true || v === "true" || v === "1";
    });

    if (body.hashtags !== undefined) {
      try {
        const parsed =
          typeof body.hashtags === "string" ? JSON.parse(body.hashtags) : body.hashtags;
        if (Array.isArray(parsed)) row.hashtags = parsed.map(String);
      } catch {
        /* skip */
      }
    }
    if (body.ctas !== undefined) {
      try {
        const parsed = typeof body.ctas === "string" ? JSON.parse(body.ctas) : body.ctas;
        if (Array.isArray(parsed)) row.ctas = parsed.slice(0, 6);
      } catch {
        /* skip */
      }
    }

    if (body.background_image_url !== undefined && !req.file) {
      const u = String(body.background_image_url).trim();
      if (u) row.background_image_url = u;
    }

    if (req.file) {
      row.background_image_url = `/uploads/cms/${path.basename(req.file.path)}`;
    }

    if (body.page_extras !== undefined) {
      try {
        const parsed =
          typeof body.page_extras === "string" ? JSON.parse(body.page_extras) : body.page_extras;
        const prev = mergedPageExtras(row.get({ plain: true }));
        const next = { ...prev };
        if (parsed && Array.isArray(parsed.marquee_phrases)) {
          next.marquee_phrases = parsed.marquee_phrases.map(String).filter((s) => s.trim());
        }
        if (parsed && parsed.cta_section && typeof parsed.cta_section === "object") {
          next.cta_section = { ...prev.cta_section, ...parsed.cta_section };
        }
        row.page_extras = next;
      } catch {
        /* ignore bad JSON */
      }
    }

    await row.save();
    return responseStatus(res, 200, "Hero updated", serializeRow(row, req));
  } catch (e) {
    console.error("patchAdminHomeHero:", e);
    return responseStatus(res, 500, "Failed to save hero CMS");
  }
};

module.exports = {
  getPublicHomeHero,
  patchAdminHomeHero,
  serializeRow,
  getOrCreateRow,
};
