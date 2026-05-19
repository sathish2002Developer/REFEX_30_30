import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import CmsVersionPanel, {
  type CmsVersionPanelHandle,
} from "../../components/admin/CmsVersionPanel";
import { showAdminError, showAdminSaveSuccess } from "../../utils/adminToast";
import { saveHomeHeroCms, fetchHomeHeroConfig } from "../../services/cmsApi";
import type { HomeHeroConfig } from "../../types/homeHeroCms";
import { DEFAULT_HOME_HERO, mergeHomeHeroFromApi } from "../../types/homeHeroCms";

type HomeCmsTab = "hero" | "marquee" | "commitment";

const tabBtn = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
      : "text-slate-400 border border-transparent hover:bg-slate-800/80 hover:text-slate-200"
  }`;

export default function AdminCmsHeroPage() {
  const [tab, setTab] = useState<HomeCmsTab>("hero");
  const [loading, setLoading] = useState(false);
  const [versionRefreshKey, setVersionRefreshKey] = useState(0);
  const versionPanelRef = useRef<CmsVersionPanelHandle>(null);

  const [h, setH] = useState<HomeHeroConfig>(DEFAULT_HOME_HERO);
  const [hashtagsText, setHashtagsText] = useState(DEFAULT_HOME_HERO.hashtags.join("\n"));

  const reloadHomeHero = useCallback(async () => {
    const data = await fetchHomeHeroConfig();
    if (data) {
      const merged = mergeHomeHeroFromApi(data);
      setH(merged);
      setHashtagsText(merged.hashtags.join("\n"));
    }
  }, []);

  useEffect(() => {
    reloadHomeHero();
  }, [reloadHomeHero]);

  const updateCta = (i: number, field: "label" | "href" | "variant", val: string) => {
    setH((prev) => {
      const ctas = [...prev.ctas];
      const cur = { ...ctas[i], [field]: val };
      ctas[i] = cur;
      return { ...prev, ctas };
    });
  };

  const addCta = () => {
    setH((prev) => ({
      ...prev,
      ctas: [...prev.ctas, { label: "New", href: "/", variant: "primary" as const }],
    }));
  };

  const removeCta = (i: number) => {
    setH((prev) => ({
      ...prev,
      ctas: prev.ctas.filter((_, idx) => idx !== i),
    }));
  };

  const updateMarqueePhrase = (index: number, value: string) => {
    setH((prev) => {
      const next = [...prev.marquee_phrases];
      next[index] = value;
      return { ...prev, marquee_phrases: next };
    });
  };

  const addMarqueePhrase = () => {
    setH((prev) => ({ ...prev, marquee_phrases: [...prev.marquee_phrases, "New phrase"] }));
  };

  const removeMarqueePhrase = (index: number) => {
    setH((prev) => ({
      ...prev,
      marquee_phrases: prev.marquee_phrases.filter((_, i) => i !== index),
    }));
  };

  const setCtaSection = (patch: Partial<HomeHeroConfig["cta_section"]>) => {
    setH((prev) => ({
      ...prev,
      cta_section: { ...prev.cta_section, ...patch },
    }));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tags = hashtagsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    const fd = new FormData();
    fd.append("top_label", h.top_label);
    fd.append("title_left", h.title_left);
    fd.append("title_middle", h.title_middle);
    fd.append("title_right", h.title_right);
    fd.append("tagline_plain", h.tagline_plain);
    fd.append("tagline_emphasis", h.tagline_emphasis);
    fd.append("subtitle_upper", h.subtitle_upper);
    fd.append("quote_text", h.quote_text);
    fd.append("hashtags", JSON.stringify(tags));
    fd.append(
      "ctas",
      JSON.stringify(
        h.ctas.map((cta, i) => ({
          label: cta.label,
          href: cta.href,
          variant: DEFAULT_HOME_HERO.ctas[i]?.variant ?? (i === 0 ? "primary" : "outline"),
        }))
      )
    );

    fd.append(
      "page_extras",
      JSON.stringify({
        marquee_phrases: h.marquee_phrases.map((s) => s.trim()).filter(Boolean),
        cta_section: h.cta_section,
      })
    );

    const input = document.getElementById("hero-bg-file") as HTMLInputElement | null;
    if (input?.files?.length) {
      fd.append("backgroundImage", input.files[0]);
    } else if (h.background_image_url?.trim()) {
      fd.append("background_image_url", h.background_image_url.trim());
    }

    const res = await saveHomeHeroCms(fd);
    setLoading(false);
    if (res.ok && res.data) {
      const merged = mergeHomeHeroFromApi(res.data);
      setH(merged);
      setHashtagsText(merged.hashtags.join("\n"));
      showAdminSaveSuccess("Successfully saved.");
      setVersionRefreshKey((k) => k + 1);
      await versionPanelRef.current?.refresh();
    } else {
      showAdminError(res.message || "Save failed.");
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-16">
      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-lg font-semibold">Home page CMS</h1>
        <p className="text-xs text-slate-500 mt-1">
          Edit text and images only — hero layout, motion, and effects use the site default design.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className={tabBtn(tab === "hero")} onClick={() => setTab("hero")}>
            Hero
          </button>
          <button
            type="button"
            className={tabBtn(tab === "marquee")}
            onClick={() => setTab("marquee")}
          >
            Marquee strip
          </button>
          <button
            type="button"
            className={tabBtn(tab === "commitment")}
            onClick={() => setTab("commitment")}
          >
            Commitment block
          </button>
        </div>
      </header>

      <form onSubmit={save} className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        <CmsVersionPanel
          ref={versionPanelRef}
          resource="home-hero"
          refreshKey={versionRefreshKey}
          onReverted={reloadHomeHero}
        />

        {tab === "hero" && (
          <>
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Background
              </h2>
              <p className="text-xs text-slate-500">
                Current resolved URL:{" "}
                <span className="text-slate-300 break-all">{h.background_image_resolved_url}</span>
              </p>
              <label className="block text-xs text-slate-400">
                Image URL (used if no file upload)
                <input
                  type="url"
                  value={h.background_image_url}
                  onChange={(e) => setH({ ...h, background_image_url: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </label>
              <input id="hero-bg-file" type="file" accept="image/*" className="text-sm" />
              <p className="text-xs text-slate-500">
                Or set image URL manually — upload replaces URL.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-4">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider md:col-span-2">
                Text
              </h2>
              <label className="md:col-span-2 block text-xs">
                Top label
                <input
                  value={h.top_label}
                  onChange={(e) => setH({ ...h, top_label: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                Title left
                <input
                  value={h.title_left}
                  onChange={(e) => setH({ ...h, title_left: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                Title middle
                <input
                  value={h.title_middle}
                  onChange={(e) => setH({ ...h, title_middle: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                Title right
                <input
                  value={h.title_right}
                  onChange={(e) => setH({ ...h, title_right: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="md:col-span-2 text-xs">
                Tagline (plain before emphasis)
                <input
                  value={h.tagline_plain}
                  onChange={(e) => setH({ ...h, tagline_plain: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="md:col-span-2 text-xs">
                Tagline (gold emphasis)
                <input
                  value={h.tagline_emphasis}
                  onChange={(e) => setH({ ...h, tagline_emphasis: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="md:col-span-2 text-xs">
                Subtitle (uppercase line)
                <input
                  value={h.subtitle_upper}
                  onChange={(e) => setH({ ...h, subtitle_upper: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="md:col-span-2 text-xs">
                Quote
                <textarea
                  rows={3}
                  value={h.quote_text}
                  onChange={(e) => setH({ ...h, quote_text: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="md:col-span-2 text-xs">
                Hashtags (one per line or comma-separated)
                <textarea
                  rows={4}
                  value={hashtagsText}
                  onChange={(e) => setHashtagsText(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono"
                />
              </label>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                  Hero CTA buttons
                </h2>
                <button
                  type="button"
                  onClick={addCta}
                  className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {h.ctas.map((cta, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap gap-2 items-end border border-slate-800 rounded-lg p-3"
                  >
                    <label className="text-xs flex-1 min-w-[120px]">
                      Label
                      <input
                        value={cta.label}
                        onChange={(e) => updateCta(i, "label", e.target.value)}
                        className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-xs flex-1 min-w-[120px]">
                      Link
                      <input
                        value={cta.href}
                        onChange={(e) => updateCta(i, "href", e.target.value)}
                        className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeCta(i)}
                      className="text-xs text-red-400 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "marquee" && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              Scrolling marquee
            </h2>
            <p className="text-xs text-slate-500">
              Phrases appear in order, separated by dots, in the animated strip below the hero.
            </p>
            <div className="space-y-2">
              {h.marquee_phrases.map((phrase, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={phrase}
                    onChange={(e) => updateMarqueePhrase(i, e.target.value)}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeMarqueePhrase(i)}
                    className="text-xs text-red-400 px-2 py-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMarqueePhrase}
              className="text-xs px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
            >
              Add phrase
            </button>
          </section>
        )}

        {tab === "commitment" && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              “Your Turn” section
            </h2>
            <label className="block text-xs">
              Eyebrow (uppercase line)
              <input
                value={h.cta_section.eyebrow}
                onChange={(e) => setCtaSection({ eyebrow: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Title — before gold emphasis
              <input
                value={h.cta_section.title_plain}
                onChange={(e) => setCtaSection({ title_plain: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Title — gold emphasis
              <input
                value={h.cta_section.title_emphasis}
                onChange={(e) => setCtaSection({ title_emphasis: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Title — after emphasis
              <input
                value={h.cta_section.title_after}
                onChange={(e) => setCtaSection({ title_after: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Body copy
              <textarea
                rows={4}
                value={h.cta_section.body}
                onChange={(e) => setCtaSection({ body: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Button label
              <input
                value={h.cta_section.button_label}
                onChange={(e) => setCtaSection({ button_label: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              Button link (e.g. /wall)
              <input
                value={h.cta_section.button_href}
                onChange={(e) => setCtaSection({ button_href: e.target.value })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          </section>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full bg-amber-500 text-slate-950 font-semibold disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save home page"}
        </button>
      </form>
    </div>
  );
}
