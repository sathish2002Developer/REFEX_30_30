export interface NavLinkCms {
  to: string;
  label: string;
}

export interface NavbarCms {
  logo_url: string;
  logo_resolved_url?: string;
  logo_alt: string;
  nav_links: NavLinkCms[];
  commitment_cta_label: string;
  commitment_cta_href: string;
  commitment_cta_arrow: string;
  sign_in_label: string;
  sign_out_label: string;
  mobile_sign_in_label: string;
}

export interface FooterCms {
  logo_url: string;
  logo_resolved_url?: string;
  logo_alt: string;
  line_left: string;
  line_right: string;
}

export interface SiteChromeCms {
  navbar: NavbarCms;
  footer: FooterCms;
}

const DEFAULT_LOGO =
  "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/757136b0-4321-4d6b-81ce-1cf238944d48_Vision-3030-May-15-1.png?v=7b45fd25577a4e4e294208870680ff9f";

export const DEFAULT_SITE_CHROME: SiteChromeCms = {
  navbar: {
    logo_url: DEFAULT_LOGO,
    logo_resolved_url: DEFAULT_LOGO,
    logo_alt: "Vision 3030",
    nav_links: [
      { to: "/", label: "Home" },
      { to: "/vision", label: "Vision" },
      { to: "/wall", label: "The Wall" },
    ],
    commitment_cta_label: "Record My Commitment",
    commitment_cta_href: "/wall",
    commitment_cta_arrow: "→",
    sign_in_label: "Sign in",
    sign_out_label: "Sign out",
    mobile_sign_in_label: "Sign in with email",
  },
  footer: {
    logo_url: DEFAULT_LOGO,
    logo_resolved_url: DEFAULT_LOGO,
    logo_alt: "Vision 3030",
    line_left: "Leadership Vision · May 22–23, 2026 · Confidential",
    line_right: "#DreamBig · #BuildTogether · #30By30",
  },
};

export function mergeSiteChromeFromApi(data: Partial<SiteChromeCms> | null): SiteChromeCms {
  if (!data) return DEFAULT_SITE_CHROME;
  const nav = {
    ...DEFAULT_SITE_CHROME.navbar,
    ...data.navbar,
    logo_resolved_url:
      data.navbar?.logo_resolved_url ||
      data.navbar?.logo_url ||
      DEFAULT_SITE_CHROME.navbar.logo_resolved_url,
    nav_links:
      Array.isArray(data.navbar?.nav_links) && data.navbar!.nav_links.length > 0
        ? data.navbar!.nav_links.map((l) => ({
            to: String(l.to || "/"),
            label: String(l.label || ""),
          }))
        : DEFAULT_SITE_CHROME.navbar.nav_links,
  };
  const foot = {
    ...DEFAULT_SITE_CHROME.footer,
    ...data.footer,
    logo_resolved_url:
      data.footer?.logo_resolved_url ||
      data.footer?.logo_url ||
      DEFAULT_SITE_CHROME.footer.logo_resolved_url,
  };
  return { navbar: nav, footer: foot };
}

/** Strip read-only fields before PATCH body */
export function siteChromeToPayload(c: SiteChromeCms): {
  navbar: Omit<NavbarCms, "logo_resolved_url">;
  footer: Omit<FooterCms, "logo_resolved_url">;
} {
  const { logo_resolved_url: _nr, ...navbar } = c.navbar;
  const { logo_resolved_url: _fr, ...footer } = c.footer;
  return { navbar, footer };
}
