import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import CmsVersionPanel, {
  type CmsVersionPanelHandle,
} from "../../components/admin/CmsVersionPanel";
import { showAdminError, showAdminSaveSuccess } from "../../utils/adminToast";
import {
  fetchVisionPageCms,
  saveVisionPageCms,
} from "../../services/cmsApi";
import type { VisionMetricCms, VisionPillarCms, VisionPageCms } from "../../types/visionCms";
import {
  mergeVisionPageCms,
  visionPageCmsToPayload,
  DEFAULT_VISION_PAGE_CMS,
} from "../../types/visionCms";

type VisionCmsTab = "hero" | "metrics" | "pillars" | "leadership";

const tabBtn = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
      : "text-slate-400 border border-transparent hover:bg-slate-800/80 hover:text-slate-200"
  }`;

export default function VisionCmsPage() {
  const [tab, setTab] = useState<VisionCmsTab>("hero");
  const [v, setV] = useState<VisionPageCms>(() => mergeVisionPageCms(null));
  const [heroParas, setHeroParas] = useState(() =>
    DEFAULT_VISION_PAGE_CMS.hero.paragraphs.join("\n\n")
  );
  const [leadParas, setLeadParas] = useState(() =>
    DEFAULT_VISION_PAGE_CMS.leadership.body_paragraphs.join("\n\n")
  );
  const [loading, setLoading] = useState(false);
  const [versionRefreshKey, setVersionRefreshKey] = useState(0);
  const versionPanelRef = useRef<CmsVersionPanelHandle>(null);

  const reloadVisionCms = useCallback(async () => {
    const data = await fetchVisionPageCms();
    const merged = mergeVisionPageCms(data);
    setV(merged);
    setHeroParas(merged.hero.paragraphs.join("\n\n"));
    setLeadParas(merged.leadership.body_paragraphs.join("\n\n"));
  }, []);

  useEffect(() => {
    reloadVisionCms();
  }, [reloadVisionCms]);

  const setMetric = (i: number, patch: Partial<VisionMetricCms>) => {
    setV((prev) => {
      const metrics = [...prev.metrics];
      metrics[i] = { ...metrics[i], ...patch };
      return { ...prev, metrics };
    });
  };

  const setPillar = (i: number, patch: Partial<VisionPillarCms>) => {
    setV((prev) => {
      const pillars = [...prev.pillars_section.pillars];
      pillars[i] = { ...pillars[i], ...patch };
      return {
        ...prev,
        pillars_section: { ...prev.pillars_section, pillars },
      };
    });
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const paragraphs = heroParas
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const body_paragraphs = leadParas
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const payloadModel: VisionPageCms = {
      ...v,
      hero: { ...v.hero, paragraphs },
      leadership: { ...v.leadership, body_paragraphs },
    };

    const fd = new FormData();
    fd.append("payload", JSON.stringify(visionPageCmsToPayload(payloadModel)));

    const heroFile = (document.getElementById("vision-hero-bg") as HTMLInputElement | null)?.files?.[0];
    if (heroFile) fd.append("heroBackground", heroFile);

    const leaderFile = (document.getElementById("vision-leader-img") as HTMLInputElement | null)?.files?.[0];
    if (leaderFile) fd.append("leaderPortrait", leaderFile);

    setLoading(true);
    try {
      const res = await saveVisionPageCms(fd);
      if (!res.ok) {
        showAdminError(res.message || "Save failed.");
        return;
      }

      showAdminSaveSuccess(res.message || "Successfully saved.");

      if (res.data) {
        try {
          const merged = mergeVisionPageCms(res.data);
          setV(merged);
          setHeroParas(merged.hero.paragraphs.join("\n\n"));
          setLeadParas(merged.leadership.body_paragraphs.join("\n\n"));
        } catch (mergeErr) {
          console.error("mergeVisionPageCms after save:", mergeErr);
          await reloadVisionCms();
        }
      }

      setVersionRefreshKey((k) => k + 1);
      try {
        await versionPanelRef.current?.refresh();
      } catch (refreshErr) {
        console.error("version panel refresh:", refreshErr);
      }
    } catch (err) {
      console.error("save vision:", err);
      showAdminError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const heroImg = v.hero.background_image_resolved_url || v.hero.background_image_url;
  const leaderImg = v.leadership.portrait_resolved_url || v.leadership.portrait_url;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-16">
      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-lg font-semibold">Vision page CMS</h1>
        <p className="text-xs text-slate-500 mt-1">Hero, metrics, pillars, and leadership block</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className={tabBtn(tab === "hero")} onClick={() => setTab("hero")}>
            Hero
          </button>
          <button
            type="button"
            className={tabBtn(tab === "metrics")}
            onClick={() => setTab("metrics")}
          >
            Metrics
          </button>
          <button
            type="button"
            className={tabBtn(tab === "pillars")}
            onClick={() => setTab("pillars")}
          >
            Pillars
          </button>
          <button
            type="button"
            className={tabBtn(tab === "leadership")}
            onClick={() => setTab("leadership")}
          >
            Leadership
          </button>
        </div>
      </header>

      <form noValidate onSubmit={save} className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        <CmsVersionPanel
          ref={versionPanelRef}
          resource="vision"
          refreshKey={versionRefreshKey}
          onReverted={reloadVisionCms}
        />

        <section className={`space-y-4 ${tab !== "hero" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Hero</h2>
          <p className="text-xs text-slate-500 break-all">Current image: {heroImg}</p>
          <label className="block text-xs text-slate-400">
            Background image URL
            <input
              type="text"
              value={v.hero.background_image_url}
              onChange={(e) => setV({ ...v, hero: { ...v.hero, background_image_url: e.target.value } })}
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="https://… or /uploads/cms/…"
            />
          </label>
          <input id="vision-hero-bg" type="file" accept="image/*" className="text-sm" />
          <label className="block text-xs">
            Overlay darkness (0–100)
            <input
              type="number"
              min={0}
              max={100}
              value={v.hero.overlay_opacity_percent}
              onChange={(e) =>
                setV({
                  ...v,
                  hero: { ...v.hero, overlay_opacity_percent: Number(e.target.value) || 0 },
                })
              }
              className="mt-1 w-full max-w-xs rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            Watermark text
            <input
              value={v.hero.watermark_text}
              onChange={(e) => setV({ ...v, hero: { ...v.hero, watermark_text: e.target.value } })}
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">Eyebrow</label>
          <input
            value={v.hero.eyebrow}
            onChange={(e) => setV({ ...v, hero: { ...v.hero, eyebrow: e.target.value } })}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <div className="grid sm:grid-cols-3 gap-2">
            <label className="text-xs sm:col-span-1">
              Headline (before gold)
              <input
                value={v.hero.headline_before}
                onChange={(e) => setV({ ...v, hero: { ...v.hero, headline_before: e.target.value } })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs sm:col-span-1">
              Gold emphasis
              <input
                value={v.hero.headline_emphasis}
                onChange={(e) => setV({ ...v, hero: { ...v.hero, headline_emphasis: e.target.value } })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs sm:col-span-1">
              Headline (after)
              <input
                value={v.hero.headline_after}
                onChange={(e) => setV({ ...v, hero: { ...v.hero, headline_after: e.target.value } })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs">Pull quote</label>
          <textarea
            rows={3}
            value={v.hero.pull_quote}
            onChange={(e) => setV({ ...v, hero: { ...v.hero, pull_quote: e.target.value } })}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Body paragraphs (blank line between)</label>
          <textarea
            rows={8}
            value={heroParas}
            onChange={(e) => setHeroParas(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-4 text-sm">
            {(
              [
                ["show_rain", "Rain animation"],
                ["show_watermark", "Watermark"],
                ["show_radial_blob", "Radial glow"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={v.hero[key]}
                  onChange={(e) => setV({ ...v, hero: { ...v.hero, [key]: e.target.checked } })}
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className={`space-y-4 ${tab !== "metrics" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Metrics row</h2>
          {v.metrics.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 border border-slate-800 rounded-lg p-3"
            >
              <label className="text-xs lg:col-span-2">
                Icon (Remix class)
                <input
                  value={m.icon}
                  onChange={(e) => setMetric(i, { icon: e.target.value })}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm font-mono"
                />
              </label>
              <label className="text-xs">
                Value
                <input
                  value={m.value}
                  onChange={(e) => setMetric(i, { value: e.target.value })}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-xs">
                Label
                <input
                  value={m.label}
                  onChange={(e) => setMetric(i, { label: e.target.value })}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-xs">
                Sublabel
                <input
                  value={m.sublabel}
                  onChange={(e) => setMetric(i, { sublabel: e.target.value })}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-xs">
                Anim ms
                <input
                  type="number"
                  value={m.duration}
                  onChange={(e) => setMetric(i, { duration: Number(e.target.value) || 1500 })}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </label>
            </div>
          ))}
        </section>

        <section className={`space-y-4 ${tab !== "pillars" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Pillars section</h2>
          <label className="block text-xs">Eyebrow</label>
          <input
            value={v.pillars_section.eyebrow}
            onChange={(e) =>
              setV({ ...v, pillars_section: { ...v.pillars_section, eyebrow: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Headline</label>
          <input
            value={v.pillars_section.headline}
            onChange={(e) =>
              setV({ ...v, pillars_section: { ...v.pillars_section, headline: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Subhead</label>
          <input
            value={v.pillars_section.subhead}
            onChange={(e) =>
              setV({ ...v, pillars_section: { ...v.pillars_section, subhead: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Bottom strip</label>
          <textarea
            rows={2}
            value={v.pillars_section.bottom_strip}
            onChange={(e) =>
              setV({ ...v, pillars_section: { ...v.pillars_section, bottom_strip: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          {v.pillars_section.pillars.map((p, i) => (
            <div key={i} className="border border-slate-800 rounded-lg p-3 space-y-2">
              <p className="text-xs text-slate-500">Pillar {i + 1}</p>
              <div className="grid sm:grid-cols-4 gap-2">
                <input
                  placeholder="num"
                  value={p.num}
                  onChange={(e) => setPillar(i, { num: e.target.value })}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
                <input
                  placeholder="icon class"
                  value={p.icon}
                  onChange={(e) => setPillar(i, { icon: e.target.value })}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm font-mono sm:col-span-1"
                />
                <input
                  placeholder="title"
                  value={p.title}
                  onChange={(e) => setPillar(i, { title: e.target.value })}
                  className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm sm:col-span-2"
                />
              </div>
              <textarea
                placeholder="Description"
                rows={2}
                value={p.desc}
                onChange={(e) => setPillar(i, { desc: e.target.value })}
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </section>

        <section className={`space-y-4 ${tab !== "leadership" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Leadership</h2>
          <p className="text-xs text-slate-500 break-all">Current portrait: {leaderImg}</p>
          <label className="block text-xs">Portrait URL</label>
          <input
            type="text"
            value={v.leadership.portrait_url}
            onChange={(e) =>
              setV({ ...v, leadership: { ...v.leadership, portrait_url: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            placeholder="https://… or /uploads/cms/…"
          />
          <input id="vision-leader-img" type="file" accept="image/*" className="text-sm" />
          <label className="block text-xs">Portrait alt text</label>
          <input
            value={v.leadership.portrait_alt}
            onChange={(e) =>
              setV({ ...v, leadership: { ...v.leadership, portrait_alt: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Eyebrow</label>
          <input
            value={v.leadership.eyebrow}
            onChange={(e) =>
              setV({ ...v, leadership: { ...v.leadership, eyebrow: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Headline line 1</label>
          <input
            value={v.leadership.headline_line1}
            onChange={(e) =>
              setV({ ...v, leadership: { ...v.leadership, headline_line1: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Headline emphasis (gold, line 2)</label>
          <input
            value={v.leadership.headline_emphasis_line2}
            onChange={(e) =>
              setV({
                ...v,
                leadership: { ...v.leadership, headline_emphasis_line2: e.target.value },
              })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Body paragraphs (blank line between)</label>
          <textarea
            rows={6}
            value={leadParas}
            onChange={(e) => setLeadParas(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Attribution</label>
          <input
            value={v.leadership.attribution}
            onChange={(e) =>
              setV({ ...v, leadership: { ...v.leadership, attribution: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full bg-amber-500 text-slate-950 font-semibold disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save vision page"}
        </button>
      </form>
    </div>
  );
}
