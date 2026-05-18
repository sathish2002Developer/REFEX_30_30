export interface HomeCtaSectionCms {
  eyebrow: string;
  title_plain: string;
  title_emphasis: string;
  title_after: string;
  body: string;
  button_label: string;
  button_href: string;
}

export type HomeHeroCtaVariant = "primary" | "outline";

export interface HomeHeroCta {
  label: string;
  href: string;
  variant: HomeHeroCtaVariant;
}

export interface HomeHeroConfig {
  top_label: string;
  title_left: string;
  title_middle: string;
  title_right: string;
  tagline_plain: string;
  tagline_emphasis: string;
  subtitle_upper: string;
  quote_text: string;
  hashtags: string[];
  ctas: HomeHeroCta[];
  background_image_url: string;
  background_image_resolved_url: string;
  overlay_opacity: number;
  radial_glow_enabled: boolean;
  radial_glow_strength_percent: number;
  particles_enabled: boolean;
  particle_canvas_opacity_percent: number;
  floating_orbs_enabled: boolean;
  rings_enabled: boolean;
  ring_rotate_seconds: number;
  ring_reverse_seconds: number;
  corner_decorations_enabled: boolean;
  stagger_animations_enabled: boolean;
  scroll_indicator_enabled: boolean;
  marquee_phrases: string[];
  cta_section: HomeCtaSectionCms;
}

export const DEFAULT_HOME_HERO: HomeHeroConfig = {
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
  background_image_url:
    "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/15181ef8-7c35-4bb8-b0ba-6d5eb33b5694_Home.jpg?v=834bb40ea63c5255d57a7b7d74094acb",
  background_image_resolved_url:
    "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/15181ef8-7c35-4bb8-b0ba-6d5eb33b5694_Home.jpg?v=834bb40ea63c5255d57a7b7d74094acb",
  overlay_opacity: 32,
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

/** CMS content fields — design/visual settings always use DEFAULT_HOME_HERO on the public site. */
const HOME_HERO_CONTENT_KEYS = [
  "top_label",
  "title_left",
  "title_middle",
  "title_right",
  "tagline_plain",
  "tagline_emphasis",
  "subtitle_upper",
  "quote_text",
] as const;

function mergeCtasFromApi(
  fromApi: Partial<HomeHeroCta>[] | undefined
): HomeHeroCta[] {
  if (!Array.isArray(fromApi) || fromApi.length === 0) {
    return DEFAULT_HOME_HERO.ctas;
  }
  return fromApi.slice(0, 6).map((cta, i) => ({
    label: String(cta.label ?? DEFAULT_HOME_HERO.ctas[i]?.label ?? ""),
    href: String(cta.href ?? DEFAULT_HOME_HERO.ctas[i]?.href ?? "/"),
    variant: DEFAULT_HOME_HERO.ctas[i]?.variant ?? (i === 0 ? "primary" : "outline"),
  }));
}

export function mergeHomeHeroFromApi(data: Partial<HomeHeroConfig> | null): HomeHeroConfig {
  if (!data) return DEFAULT_HOME_HERO;

  const content: Partial<HomeHeroConfig> = {};
  for (const key of HOME_HERO_CONTENT_KEYS) {
    if (data[key] !== undefined && data[key] !== null) {
      content[key] = String(data[key]);
    }
  }

  const bgResolved =
    data.background_image_resolved_url ||
    data.background_image_url ||
    DEFAULT_HOME_HERO.background_image_resolved_url;
  const bgUrl = data.background_image_url || DEFAULT_HOME_HERO.background_image_url;

  return {
    ...DEFAULT_HOME_HERO,
    ...content,
    hashtags:
      Array.isArray(data.hashtags) && data.hashtags.length > 0
        ? data.hashtags.map(String)
        : DEFAULT_HOME_HERO.hashtags,
    ctas: mergeCtasFromApi(data.ctas),
    background_image_url: bgUrl,
    background_image_resolved_url: bgResolved,
    marquee_phrases:
      Array.isArray(data.marquee_phrases) && data.marquee_phrases.length > 0
        ? data.marquee_phrases.map(String)
        : DEFAULT_HOME_HERO.marquee_phrases,
    cta_section: {
      ...DEFAULT_HOME_HERO.cta_section,
      ...(data.cta_section && typeof data.cta_section === "object" ? data.cta_section : {}),
    },
  };
}
