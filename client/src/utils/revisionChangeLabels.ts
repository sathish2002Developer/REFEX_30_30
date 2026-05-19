const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  designation: "Designation",
  team_entity: "Team / entity",
  is_active: "Active",
  avatar_url: "Profile photo",
  had_password: "Had password",
  top_label: "Top label",
  title_left: "Title left",
  title_middle: "Title middle",
  title_right: "Title right",
  tagline_plain: "Tagline",
  tagline_emphasis: "Tagline emphasis",
  subtitle_upper: "Subtitle",
  quote_text: "Quote",
  hashtags: "Hashtags",
  ctas: "Call-to-action buttons",
  background_image_url: "Background image",
  overlay_opacity: "Overlay opacity",
  marquee_phrases: "Marquee phrases",
  "hero.eyebrow": "Hero eyebrow",
  "hero.typing_lines": "Hero typing lines",
  "hero.intro": "Hero intro",
  "hero.hero_image_url": "Hero image",
  "labels.sign_in_hint": "Sign-in hint",
  "labels.loading_the_wall": "Loading message",
  "labels.empty_state": "Empty state message",
  "sidebar.word_cloud": "Trending words",
  "sidebar.daily_prompts": "Daily prompts",
  "sidebar.vision_quotes": "Vision quotes",
  "sidebar.top_contributors": "Top contributors",
  "theme.page_background": "Page background color",
  "theme.page_background_image_url": "Page background image",
  "theme.hero_background": "Hero background color",
  "theme.accent": "Accent color",
  "theme.headline": "Headline color",
  "theme.card_background": "Card background",
  "sidebar.active_leaders_title": "Active leaders title",
  "navbar.nav_links": "Nav links",
  "footer.copyright": "Footer copyright",
};

export function labelForRevisionField(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const last = field.split(".").pop() || field;
  if (FIELD_LABELS[last]) return FIELD_LABELS[last];
  return field
    .split(".")
    .map((p) => p.replace(/_/g, " "))
    .join(" › ");
}
