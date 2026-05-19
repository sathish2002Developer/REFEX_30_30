import type { WallThemeCms } from "../../utils/wallTheme";

function pickerValue(hex: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";
}

export function ThemeColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <div className="flex gap-2 mt-1 items-center">
        <input
          type="color"
          value={pickerValue(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 rounded cursor-pointer bg-slate-900 border border-slate-700"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono"
          placeholder="#hex or rgb(...)"
        />
      </div>
    </label>
  );
}

interface WallThemeFieldsProps {
  theme: WallThemeCms;
  onChange: (patch: Partial<WallThemeCms>) => void;
}

export function WallThemeFields({ theme, onChange }: WallThemeFieldsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Page</h3>
        <ThemeColorInput
          label="Page background color"
          value={theme.page_background}
          onChange={(page_background) => onChange({ page_background })}
        />
        <label className="block text-xs text-slate-400">
          Page background image URL (optional)
          <input
            type="text"
            value={theme.page_background_image_url}
            onChange={(e) => onChange({ page_background_image_url: e.target.value })}
            className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            placeholder="https://… or /uploads/cms/…"
          />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Hero</h3>
        <ThemeColorInput
          label="Hero area background (behind image)"
          value={theme.hero_background}
          onChange={(hero_background) => onChange({ hero_background })}
        />
        <ThemeColorInput
          label="Fallback gradient — start"
          value={theme.hero_fallback_start}
          onChange={(hero_fallback_start) => onChange({ hero_fallback_start })}
        />
        <ThemeColorInput
          label="Fallback gradient — middle"
          value={theme.hero_fallback_mid}
          onChange={(hero_fallback_mid) => onChange({ hero_fallback_mid })}
        />
        <ThemeColorInput
          label="Fallback gradient — end"
          value={theme.hero_fallback_end}
          onChange={(hero_fallback_end) => onChange({ hero_fallback_end })}
        />
        <label className="block text-xs text-slate-400">
          Hero white overlay opacity (0–100)
          <input
            type="number"
            min={0}
            max={100}
            value={theme.hero_overlay_opacity_percent}
            onChange={(e) =>
              onChange({ hero_overlay_opacity_percent: Number(e.target.value) || 0 })
            }
            className="mt-1 w-full max-w-xs rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Accent & text
        </h3>
        <ThemeColorInput
          label="Accent (links, highlights)"
          value={theme.accent}
          onChange={(accent) => onChange({ accent })}
        />
        <ThemeColorInput
          label="Accent hover / dark"
          value={theme.accent_dark}
          onChange={(accent_dark) => onChange({ accent_dark })}
        />
        <ThemeColorInput
          label="Accent light (badges, chips)"
          value={theme.accent_light}
          onChange={(accent_light) => onChange({ accent_light })}
        />
        <ThemeColorInput
          label="Eyebrow / labels"
          value={theme.eyebrow}
          onChange={(eyebrow) => onChange({ eyebrow })}
        />
        <ThemeColorInput
          label="Headlines"
          value={theme.headline}
          onChange={(headline) => onChange({ headline })}
        />
        <ThemeColorInput
          label="Body text"
          value={theme.body_text}
          onChange={(body_text) => onChange({ body_text })}
        />
        <ThemeColorInput
          label="Muted text"
          value={theme.muted_text}
          onChange={(muted_text) => onChange({ muted_text })}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Cards & sidebar
        </h3>
        <ThemeColorInput
          label="Card / panel background"
          value={theme.card_background}
          onChange={(card_background) => onChange({ card_background })}
        />
        <ThemeColorInput
          label="Card border"
          value={theme.card_border}
          onChange={(card_border) => onChange({ card_border })}
        />
        <ThemeColorInput
          label="Card border on hover"
          value={theme.card_hover_border}
          onChange={(card_hover_border) => onChange({ card_hover_border })}
        />
        <ThemeColorInput
          label="Progress ring (active leaders)"
          value={theme.progress_ring}
          onChange={(progress_ring) => onChange({ progress_ring })}
        />
      </div>
    </div>
  );
}
