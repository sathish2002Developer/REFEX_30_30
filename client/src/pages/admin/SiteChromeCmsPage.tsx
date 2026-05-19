import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import CmsVersionPanel, {
  type CmsVersionPanelHandle,
} from "../../components/admin/CmsVersionPanel";
import { showAdminError, showAdminSaveSuccess } from "../../utils/adminToast";
import { fetchSiteChrome, saveSiteChromeCms } from "../../services/cmsApi";
import { useSiteChrome } from "../../context/SiteChromeContext";
import type { NavLinkCms, SiteChromeCms } from "../../types/siteChromeCms";
import {
  DEFAULT_SITE_CHROME,
  mergeSiteChromeFromApi,
  siteChromeToPayload,
} from "../../types/siteChromeCms";

type ChromeTab = "navbar" | "footer";

const tabBtn = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
      : "text-slate-400 border border-transparent hover:bg-slate-800/80 hover:text-slate-200"
  }`;

export default function SiteChromeCmsPage() {
  const { reload } = useSiteChrome();
  const [tab, setTab] = useState<ChromeTab>("navbar");
  const [c, setC] = useState<SiteChromeCms>(() => DEFAULT_SITE_CHROME);
  const [loading, setLoading] = useState(false);
  const [versionRefreshKey, setVersionRefreshKey] = useState(0);
  const versionPanelRef = useRef<CmsVersionPanelHandle>(null);

  const reloadSiteChromeEditor = useCallback(async () => {
    const data = await fetchSiteChrome();
    setC(mergeSiteChromeFromApi(data));
  }, []);

  const reloadSiteChromeAfterRevert = useCallback(async () => {
    await reloadSiteChromeEditor();
    await reload();
  }, [reloadSiteChromeEditor, reload]);

  useEffect(() => {
    reloadSiteChromeEditor();
  }, [reloadSiteChromeEditor]);

  const updateNavLink = (i: number, field: keyof NavLinkCms, val: string) => {
    setC((prev) => {
      const nav_links = [...prev.navbar.nav_links];
      nav_links[i] = { ...nav_links[i], [field]: val };
      return { ...prev, navbar: { ...prev.navbar, nav_links } };
    });
  };

  const addNavLink = () => {
    setC((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        nav_links: [...prev.navbar.nav_links, { to: "/", label: "New" }],
      },
    }));
  };

  const removeNavLink = (i: number) => {
    setC((prev) => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        nav_links: prev.navbar.nav_links.filter((_, idx) => idx !== i),
      },
    }));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("payload", JSON.stringify(siteChromeToPayload(c)));

    const navFile = (document.getElementById("chrome-navbar-logo") as HTMLInputElement | null)
      ?.files?.[0];
    if (navFile) fd.append("navbarLogo", navFile);

    const footFile = (document.getElementById("chrome-footer-logo") as HTMLInputElement | null)
      ?.files?.[0];
    if (footFile) fd.append("footerLogo", footFile);

    const res = await saveSiteChromeCms(fd);
    setLoading(false);
    if (res.ok && res.data) {
      setC(mergeSiteChromeFromApi(res.data));
      showAdminSaveSuccess("Successfully saved.");
      setVersionRefreshKey((k) => k + 1);
      await versionPanelRef.current?.refresh();
      await reload();
    } else {
      showAdminError(res.message || "Save failed.");
    }
  };

  const navLogo = c.navbar.logo_resolved_url || c.navbar.logo_url;
  const footLogo = c.footer.logo_resolved_url || c.footer.logo_url;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-16">
      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-lg font-semibold">Navbar & footer CMS</h1>
        <p className="text-xs text-slate-500 mt-1">Global navigation and footer (all pages)</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            className={tabBtn(tab === "navbar")}
            onClick={() => setTab("navbar")}
          >
            Navbar
          </button>
          <button type="button" className={tabBtn(tab === "footer")} onClick={() => setTab("footer")}>
            Footer
          </button>
        </div>
      </header>

      <form onSubmit={save} className="max-w-4xl mx-auto px-8 py-8 space-y-10">
        <CmsVersionPanel
          ref={versionPanelRef}
          resource="site-chrome"
          refreshKey={versionRefreshKey}
          onReverted={reloadSiteChromeAfterRevert}
        />

        <section className={`space-y-4 ${tab !== "navbar" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Navbar</h2>
          <p className="text-xs text-slate-500 break-all">Current logo: {navLogo}</p>
          <label className="block text-xs text-slate-400">
            Logo image URL
            <input
              type="url"
              value={c.navbar.logo_url}
              onChange={(e) =>
                setC({ ...c, navbar: { ...c.navbar, logo_url: e.target.value } })
              }
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            />
          </label>
          <input id="chrome-navbar-logo" type="file" accept="image/*" className="text-sm" />
          <label className="block text-xs">Logo alt text</label>
          <input
            value={c.navbar.logo_alt}
            onChange={(e) =>
              setC({ ...c, navbar: { ...c.navbar, logo_alt: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nav links
            </h3>
            <button
              type="button"
              onClick={addNavLink}
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
            >
              Add link
            </button>
          </div>
          <div className="space-y-2">
            {c.navbar.nav_links.map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-end border border-slate-800 rounded-lg p-3">
                <label className="text-xs flex-1 min-w-[100px]">
                  Path
                  <input
                    value={link.to}
                    onChange={(e) => updateNavLink(i, "to", e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm font-mono"
                  />
                </label>
                <label className="text-xs flex-1 min-w-[100px]">
                  Label
                  <input
                    value={link.label}
                    onChange={(e) => updateNavLink(i, "label", e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeNavLink(i)}
                  className="text-xs text-red-400 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            Commitment button (desktop + mobile)
          </h3>
          <label className="block text-xs">Label</label>
          <input
            value={c.navbar.commitment_cta_label}
            onChange={(e) =>
              setC({ ...c, navbar: { ...c.navbar, commitment_cta_label: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Link (e.g. /wall)</label>
          <input
            value={c.navbar.commitment_cta_href}
            onChange={(e) =>
              setC({ ...c, navbar: { ...c.navbar, commitment_cta_href: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Arrow / suffix character</label>
          <input
            value={c.navbar.commitment_cta_arrow}
            onChange={(e) =>
              setC({ ...c, navbar: { ...c.navbar, commitment_cta_arrow: e.target.value } })
            }
            className="w-full max-w-xs rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            Auth labels
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs">
              Sign in (desktop)
              <input
                value={c.navbar.sign_in_label}
                onChange={(e) =>
                  setC({ ...c, navbar: { ...c.navbar, sign_in_label: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              Sign out
              <input
                value={c.navbar.sign_out_label}
                onChange={(e) =>
                  setC({ ...c, navbar: { ...c.navbar, sign_out_label: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              Sign in (mobile)
              <input
                value={c.navbar.mobile_sign_in_label}
                onChange={(e) =>
                  setC({ ...c, navbar: { ...c.navbar, mobile_sign_in_label: e.target.value } })
                }
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className={`space-y-4 ${tab !== "footer" ? "hidden" : ""}`}>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Footer</h2>
          <p className="text-xs text-slate-500 break-all">Current logo: {footLogo}</p>
          <label className="block text-xs text-slate-400">
            Logo image URL
            <input
              type="url"
              value={c.footer.logo_url}
              onChange={(e) =>
                setC({ ...c, footer: { ...c.footer, logo_url: e.target.value } })
              }
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            />
          </label>
          <input id="chrome-footer-logo" type="file" accept="image/*" className="text-sm" />
          <label className="block text-xs">Logo alt text</label>
          <input
            value={c.footer.logo_alt}
            onChange={(e) =>
              setC({ ...c, footer: { ...c.footer, logo_alt: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Left line</label>
          <input
            value={c.footer.line_left}
            onChange={(e) =>
              setC({ ...c, footer: { ...c.footer, line_left: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <label className="block text-xs">Right line (hashtags / tagline)</label>
          <input
            value={c.footer.line_right}
            onChange={(e) =>
              setC({ ...c, footer: { ...c.footer, line_right: e.target.value } })
            }
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full bg-amber-500 text-slate-950 font-semibold disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save navbar & footer"}
        </button>
      </form>
    </div>
  );
}
