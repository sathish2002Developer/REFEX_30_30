export interface VisionHeroCms {
  background_image_url: string;
  background_image_resolved_url?: string;
  overlay_opacity_percent: number;
  watermark_text: string;
  eyebrow: string;
  headline_before: string;
  headline_emphasis: string;
  headline_after: string;
  pull_quote: string;
  paragraphs: string[];
  show_rain: boolean;
  show_watermark: boolean;
  show_radial_blob: boolean;
}

export interface VisionMetricCms {
  icon: string;
  value: string;
  label: string;
  sublabel: string;
  duration: number;
}

export interface VisionPillarCms {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

export interface VisionPillarsSectionCms {
  eyebrow: string;
  headline: string;
  subhead: string;
  pillars: VisionPillarCms[];
  bottom_strip: string;
}

export interface VisionLeadershipCms {
  eyebrow: string;
  portrait_url: string;
  portrait_resolved_url?: string;
  headline_line1: string;
  headline_emphasis_line2: string;
  body_paragraphs: string[];
  attribution: string;
  portrait_alt: string;
}

export interface VisionPageCms {
  hero: VisionHeroCms;
  metrics: VisionMetricCms[];
  pillars_section: VisionPillarsSectionCms;
  leadership: VisionLeadershipCms;
}

function isPlainObject(o: unknown): o is Record<string, unknown> {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}

function deepMerge<T extends Record<string, unknown>>(base: T, overlay: Partial<T>): T {
  const out = { ...base } as T;
  for (const k of Object.keys(overlay) as (keyof T)[]) {
    const bv = base[k];
    const ov = overlay[k];
    if (ov === undefined) continue;
    if (isPlainObject(bv) && isPlainObject(ov)) {
      (out as Record<string, unknown>)[k as string] = deepMerge(
        bv as Record<string, unknown>,
        ov as Record<string, unknown>
      );
    } else {
      (out as Record<string, unknown>)[k as string] = ov;
    }
  }
  return out;
}

/** Defaults mirror backend `defaultVisionPayload` for offline / failed fetch fallback. */
export const DEFAULT_VISION_PAGE_CMS: VisionPageCms = {
  hero: {
    background_image_url:
      "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/7a9ddfbd-1202-4660-af3a-eb88ce0facf1_Vision.jpg?v=175577d8715374fbeca5a1f3604f20c9",
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
    portrait_url:
      "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/b7168d81-2b49-4366-8350-193171425988_Anil-39_s-Portrait-1.jpg?v=ad3620b8c574da4ef48e8365147b2f0f",
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

export function mergeVisionPageCms(api: VisionPageCms | null): VisionPageCms {
  if (!api) return DEFAULT_VISION_PAGE_CMS;
  const base = DEFAULT_VISION_PAGE_CMS;
  const hero = deepMerge(
    base.hero as unknown as Record<string, unknown>,
    (api.hero || {}) as Record<string, unknown>
  ) as unknown as VisionHeroCms;
  const pillars_section = deepMerge(
    base.pillars_section as unknown as Record<string, unknown>,
    (api.pillars_section || {}) as Record<string, unknown>
  ) as unknown as VisionPillarsSectionCms;
  if (api.pillars_section?.pillars?.length) pillars_section.pillars = api.pillars_section.pillars;
  const leadership = deepMerge(
    base.leadership as unknown as Record<string, unknown>,
    (api.leadership || {}) as Record<string, unknown>
  ) as unknown as VisionLeadershipCms;
  return {
    hero: {
      ...hero,
      background_image_resolved_url:
        api.hero?.background_image_resolved_url ||
        hero.background_image_resolved_url ||
        hero.background_image_url,
    },
    metrics: api.metrics?.length ? api.metrics : base.metrics,
    pillars_section,
    leadership: {
      ...leadership,
      portrait_resolved_url:
        api.leadership?.portrait_resolved_url ||
        leadership.portrait_resolved_url ||
        leadership.portrait_url,
    },
  };
}

/** Strip computed fields before sending to admin API */
export function visionPageCmsToPayload(v: VisionPageCms): VisionPageCms {
  const hero = v.hero as VisionHeroCms & { background_image_resolved_url?: string };
  const { background_image_resolved_url: _h, ...heroRest } = hero;
  const lead = v.leadership as VisionLeadershipCms & { portrait_resolved_url?: string };
  const { portrait_resolved_url: _p, ...leadRest } = lead;
  return {
    hero: heroRest,
    metrics: v.metrics,
    pillars_section: v.pillars_section,
    leadership: leadRest,
  };
}
