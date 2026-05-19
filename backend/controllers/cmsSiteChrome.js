const path = require("path");
const { CmsSiteChrome } = require("../models");
const { responseStatus } = require("../helpers/response");
const { archiveCurrentRevision } = require("../helpers/cmsRevisionHelper");

const DEFAULT_LOGO =
  "https://storage.readdy-site.link/project_files/04e95ea7-e673-4199-a33e-5a962ce92760/757136b0-4321-4d6b-81ce-1cf238944d48_Vision-3030-May-15-1.png?v=7b45fd25577a4e4e294208870680ff9f";

function isPlainObject(o) {
  return o !== null && typeof o === "object" && !Array.isArray(o);
}

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

function defaultPayload() {
  return {
    navbar: {
      logo_url: DEFAULT_LOGO,
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
      logo_alt: "Vision 3030",
      line_left: "Leadership Vision · May 22–23, 2026 · Confidential",
      line_right: "#DreamBig · #BuildTogether · #30By30",
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

function mergePayload(dbPayload, incoming) {
  let next = deepMerge(defaultPayload(), dbPayload || {});
  next = deepMerge(next, incoming || {});
  if (incoming?.navbar && Array.isArray(incoming.navbar.nav_links)) {
    const defLinks = defaultPayload();
    const n = incoming.navbar.nav_links
      .filter((l) => l && typeof l.to === "string" && typeof l.label === "string")
      .map((l) => ({ to: String(l.to).trim(), label: String(l.label).trim() }))
      .slice(0, 12);
    next.navbar.nav_links = n.length > 0 ? n : defLinks.navbar.nav_links;
  }
  const def = defaultPayload();
  if (!Array.isArray(next.navbar.nav_links) || next.navbar.nav_links.length === 0) {
    next.navbar.nav_links = def.navbar.nav_links;
  }
  return next;
}

function serializePayload(payload, req) {
  const p = mergePayload(payload, {});
  const navLogo = resolveAssetUrl(p.navbar?.logo_url, req);
  const footLogo = resolveAssetUrl(p.footer?.logo_url, req);
  return {
    navbar: {
      ...p.navbar,
      logo_url: p.navbar?.logo_url || DEFAULT_LOGO,
      logo_resolved_url: navLogo || p.navbar?.logo_url || DEFAULT_LOGO,
    },
    footer: {
      ...p.footer,
      logo_url: p.footer?.logo_url || DEFAULT_LOGO,
      logo_resolved_url: footLogo || p.footer?.logo_url || DEFAULT_LOGO,
    },
  };
}

function pickUploaded(relPath) {
  if (!relPath) return "";
  return `/uploads/cms/${path.basename(relPath)}`;
}

async function getOrCreateRow() {
  let row = await CmsSiteChrome.findOne({ where: { singleton_key: "main" } });
  if (!row) {
    row = await CmsSiteChrome.create({
      singleton_key: "main",
      payload: defaultPayload(),
    });
  }
  return row;
}

const getPublicSiteChrome = async (req, res) => {
  try {
    const row = await getOrCreateRow();
    const plain = row.get({ plain: true });
    const data = serializePayload(plain.payload || {}, req);
    return responseStatus(res, 200, "OK", data);
  } catch (e) {
    console.error("getPublicSiteChrome:", e);
    return responseStatus(res, 500, "Failed to load site chrome CMS");
  }
};

const patchAdminSiteChrome = async (req, res) => {
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
      console.error("patchAdminSiteChrome parse:", parseErr);
      return responseStatus(res, 400, "Invalid JSON payload");
    }

    const files = req.files || {};
    if (files.navbarLogo?.[0]?.filename) {
      incoming = deepMerge(incoming, {
        navbar: { logo_url: pickUploaded(files.navbarLogo[0].path) },
      });
    }
    if (files.footerLogo?.[0]?.filename) {
      incoming = deepMerge(incoming, {
        footer: { logo_url: pickUploaded(files.footerLogo[0].path) },
      });
    }

    await archiveCurrentRevision("site-chrome", req);
    row.payload = mergePayload(row.payload || {}, incoming);
    await row.save();

    const out = serializePayload(row.payload, req);
    return responseStatus(res, 200, "Saved", out);
  } catch (e) {
    console.error("patchAdminSiteChrome:", e);
    return responseStatus(res, 500, "Failed to save site chrome CMS");
  }
};

module.exports = {
  getPublicSiteChrome,
  patchAdminSiteChrome,
  defaultPayload,
  serializePayload,
};
