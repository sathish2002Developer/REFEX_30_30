"use strict";

const path = require("path");
const { CmsVisionPage } = require("../models");
const { responseStatus } = require("../helpers/response");
const { archiveCurrentRevision } = require("../helpers/cmsRevisionHelper");

const DEFAULT_HERO_BG =
  "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/7a9ddfbd-1202-4660-af3a-eb88ce0facf1_Vision.jpg?v=175577d8715374fbeca5a1f3604f20c9";

const DEFAULT_LEADER_IMG =
  "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/b7168d81-2b49-4366-8350-193171425988_Anil-39_s-Portrait-1.jpg?v=ad3620b8c574da4ef48e8365147b2f0f";

function isPlainObject(o) {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}

/** Shallow-merge objects; recurse into nested plain objects only. Arrays copied by reference unless replaced at caller. */
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

function defaultVisionPayload() {
  return {
    hero: {
      background_image_url: DEFAULT_HERO_BG,
      overlay_opacity_percent: 0,
      watermark_text: "30 By 30",
      eyebrow: "Our Vision",
      headline_before: "Building a ",
      headline_emphasis: "30 Billion Dollar",
      headline_after: " organisation by 2030",
      pull_quote:
        '"Extraordinary futures are created when leaders suspend ordinary thinking and collectively explore strengths, possibilities, and audacious aspirations."',
      paragraphs: [
        "Refex Group stands at an inflection point. Having demonstrated the courage to grow 100x, we now set our sights on a new horizon — becoming a USD 30 Billion organisation by 2030.",
        "This is not a number. It is a declaration of collective belief, strategic clarity, and the courage to think at an entirely different scale.",
        "Anchored in Appreciative Inquiry and Future Search, the Refex 30 By 30 journey is a shared leadership experience — to dream, to align, and to co-create the next chapter of Refex.",
      ],
      show_rain: true,
      show_watermark: true,
      show_radial_blob: true,
    },
    metrics: [
      {
        icon: "ri-funds-line",
        value: "$30",
        label: "USD Target by 2030",
        sublabel: "Billion USD",
        duration: 1600,
      },
      {
        icon: "ri-calendar-check-line",
        value: "2030",
        label: "Our shared destination",
        sublabel: "Mission milestone",
        duration: 2000,
      },
      {
        icon: "ri-earth-line",
        value: "6+",
        label: "Business verticals driving growth",
        sublabel: "Across continents",
        duration: 800,
      },
      {
        icon: "ri-team-line",
        value: "43",
        label: "Leaders. One vision",
        sublabel: "Vision aligned",
        duration: 1200,
      },
    ],
    pillars_section: {
      eyebrow: "The 30 By 30 Vision",
      headline: "More than a financial aspiration.",
      subhead: "A vision to build:",
      pillars: [
        {
          num: "01",
          icon: "ri-global-line",
          title: "A Globally Respected Enterprise",
          desc: "A name that carries weight in boardrooms, markets, and communities well beyond India.",
        },
        {
          num: "02",
          icon: "ri-flashlight-line",
          title: "Future-Defining Businesses",
          desc: "Category leaders in energy, mobility, airports, life sciences, and healthcare — not participants, but pioneers.",
        },
        {
          num: "03",
          icon: "ri-building-2-line",
          title: "An Enduring Institution",
          desc: "One that outlasts individual tenures — built on systems, culture, and leaders who keep raising the bar.",
        },
        {
          num: "04",
          icon: "ri-focus-3-line",
          title: "Meaningful Impact at Scale",
          desc: "Value created for shareholders, customers, communities, and the nation — not just the balance sheet.",
        },
      ],
      bottom_strip:
        "Powered by: Energy Transition · Infrastructure · Sustainable Mobility · Life Sciences · Healthcare Innovation · Semiconductors",
    },
    leadership: {
      eyebrow: "A Message from Leadership",
      portrait_url: DEFAULT_LEADER_IMG,
      headline_line1: "This is not an offsite.",
      headline_emphasis_line2: "This is a defining leadership moment for Refex Group.",
      body_paragraphs: [
        "What got us here will not take us there.",
        "We have done the impossible before. We will do it again.",
        "We win or we learn. We do not fail.",
      ],
      attribution: "MD & Chairman, Refex Group",
      portrait_alt: "MD & Chairman, Refex Group",
    },
  };
}

function resolveAssetUrl(raw, req) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const p = s.startsWith("/") ? s : `/${s}`;
  return `${req.protocol}://${req.get("host")}${p}`;
}

function mergeIncomingPayload(dbPayload, incoming) {
  let next = deepMerge(defaultVisionPayload(), dbPayload || {});
  next = deepMerge(next, incoming || {});

  if (incoming && Array.isArray(incoming.metrics)) next.metrics = incoming.metrics;
  if (incoming?.hero && Array.isArray(incoming.hero.paragraphs))
    next.hero.paragraphs = [...incoming.hero.paragraphs];
  if (incoming?.pillars_section && Array.isArray(incoming.pillars_section.pillars))
    next.pillars_section.pillars = [...incoming.pillars_section.pillars];
  if (incoming?.leadership && Array.isArray(incoming.leadership.body_paragraphs))
    next.leadership.body_paragraphs = [...incoming.leadership.body_paragraphs];

  return next;
}

function serializeForResponse(payload, req) {
  const p = mergeIncomingPayload(payload, {});
  const heroBg = resolveAssetUrl(p.hero?.background_image_url, req);
  const portrait = resolveAssetUrl(p.leadership?.portrait_url, req);
  return {
    ...p,
    hero: {
      ...p.hero,
      background_image_url: p.hero?.background_image_url || DEFAULT_HERO_BG,
      background_image_resolved_url: heroBg || p.hero?.background_image_url || DEFAULT_HERO_BG,
    },
    leadership: {
      ...p.leadership,
      portrait_url: p.leadership?.portrait_url || DEFAULT_LEADER_IMG,
      portrait_resolved_url: portrait || p.leadership?.portrait_url || DEFAULT_LEADER_IMG,
    },
  };
}

async function getOrCreateRow() {
  let row = await CmsVisionPage.findOne({ where: { singleton_key: "main" } });
  if (!row) {
    row = await CmsVisionPage.create({
      singleton_key: "main",
      payload: defaultVisionPayload(),
    });
  }
  return row;
}

const getPublicVisionPage = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    const plain = row.get({ plain: true });
    const payload = serializeForResponse(plain.payload || {}, req);
    return responseStatus(res, 200, "OK", payload);
  } catch (e) {
    console.error("getPublicVisionPage:", e);
    return responseStatus(res, 500, "Failed to load vision CMS");
  }
};

function pickUploaded(relPath) {
  if (!relPath) return "";
  const base = path.basename(relPath);
  return `/uploads/cms/${base}`;
}

const patchAdminVisionPage = async (req, res) => {
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
      console.error("patchAdminVisionPage parse:", parseErr);
      return responseStatus(res, 400, "Invalid JSON payload");
    }

    const files = req.files || {};
    if (files.heroBackground?.[0]?.filename)
      incoming = deepMerge(incoming, {
        hero: { background_image_url: pickUploaded(files.heroBackground[0].path) },
      });
    if (files.leaderPortrait?.[0]?.filename)
      incoming = deepMerge(incoming, {
        leadership: { portrait_url: pickUploaded(files.leaderPortrait[0].path) },
      });

    await archiveCurrentRevision("vision", req);
    row.payload = mergeIncomingPayload(row.payload || {}, incoming);
    await row.save();

    const out = serializeForResponse(row.payload, req);
    return responseStatus(res, 200, "Saved", out);
  } catch (e) {
    console.error("patchAdminVisionPage:", e);
    return responseStatus(res, 500, "Failed to save vision CMS");
  }
};

module.exports = {
  defaultVisionPayload,
  getPublicVisionPage,
  patchAdminVisionPage,
  serializeForResponse,
};
