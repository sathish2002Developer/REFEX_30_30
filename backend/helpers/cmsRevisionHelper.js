const {
  CmsRevision,
  CmsHomeHero,
  CmsWallPage,
  CmsVisionPage,
  CmsSiteChrome,
  User,
} = require("../models");
const { computeRevisionChanges } = require("./revisionDiff");

const MAX_REVISIONS = 50;

const RESOURCE_CONFIG = {
  "home-hero": { model: CmsHomeHero, singletonKey: "home", payloadField: null },
  vision: { model: CmsVisionPage, singletonKey: "main", payloadField: "payload" },
  "site-chrome": { model: CmsSiteChrome, singletonKey: "main", payloadField: "payload" },
  wall: { model: CmsWallPage, singletonKey: "main", payloadField: "payload" },
};

const HOME_HERO_SNAPSHOT_KEYS = [
  "top_label",
  "title_left",
  "title_middle",
  "title_right",
  "tagline_plain",
  "tagline_emphasis",
  "subtitle_upper",
  "quote_text",
  "hashtags",
  "ctas",
  "background_image_url",
  "overlay_opacity",
  "radial_glow_enabled",
  "radial_glow_strength_percent",
  "particles_enabled",
  "particle_canvas_opacity_percent",
  "floating_orbs_enabled",
  "rings_enabled",
  "ring_rotate_seconds",
  "ring_reverse_seconds",
  "corner_decorations_enabled",
  "stagger_animations_enabled",
  "scroll_indicator_enabled",
  "page_extras",
];

function isValidResourceType(type) {
  return Boolean(RESOURCE_CONFIG[type]);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function snapshotHomeHeroRow(row) {
  const plain = row.get({ plain: true });
  const out = {};
  for (const k of HOME_HERO_SNAPSHOT_KEYS) {
    if (plain[k] !== undefined) out[k] = cloneJson(plain[k]);
  }
  return out;
}

function applyHomeHeroSnapshot(row, snapshot) {
  for (const k of HOME_HERO_SNAPSHOT_KEYS) {
    if (snapshot[k] !== undefined) row[k] = cloneJson(snapshot[k]);
  }
}

async function getSingletonRow(resourceType) {
  const cfg = RESOURCE_CONFIG[resourceType];
  const row = await cfg.model.findOne({ where: { singleton_key: cfg.singletonKey } });
  if (!row) {
    throw new Error(`CMS row not found for ${resourceType}`);
  }
  return row;
}

function getSnapshotFromRow(resourceType, row) {
  const cfg = RESOURCE_CONFIG[resourceType];
  if (cfg.payloadField) {
    return cloneJson(row[cfg.payloadField] || {});
  }
  return snapshotHomeHeroRow(row);
}

function applySnapshotToRow(resourceType, row, snapshot) {
  const cfg = RESOURCE_CONFIG[resourceType];
  if (cfg.payloadField) {
    row[cfg.payloadField] = cloneJson(snapshot);
    return;
  }
  applyHomeHeroSnapshot(row, snapshot);
}

async function actorFromReq(req) {
  const data = req.userData || {};
  const id = data.id ?? null;
  let email = data.email ? String(data.email) : null;
  if (id && !email) {
    try {
      const user = await User.findByPk(id, { attributes: ["email"] });
      if (user?.email) email = user.email;
    } catch {
      /* optional lookup */
    }
  }
  return {
    created_by: id,
    created_by_email: email,
  };
}

async function nextVersionNumber(resourceType) {
  const max = await CmsRevision.max("version_number", {
    where: { resource_type: resourceType },
  });
  return (Number(max) || 0) + 1;
}

async function trimOldRevisions(resourceType) {
  const rows = await CmsRevision.findAll({
    where: { resource_type: resourceType },
    order: [["version_number", "DESC"]],
    attributes: ["id"],
    offset: MAX_REVISIONS,
  });
  if (!rows.length) return;
  const ids = rows.map((r) => r.id);
  await CmsRevision.destroy({ where: { id: ids } });
}

/** Archive current live CMS state before applying a new save or revert. */
async function archiveCurrentRevision(resourceType, req, label) {
  if (!isValidResourceType(resourceType)) return null;
  const row = await getSingletonRow(resourceType);
  const snapshot = getSnapshotFromRow(resourceType, row);
  const version = await nextVersionNumber(resourceType);
  const actor = await actorFromReq(req);
  const revision = await CmsRevision.create({
    resource_type: resourceType,
    version_number: version,
    payload: snapshot,
    label: label || `Version ${version}`,
    ...actor,
  });
  await trimOldRevisions(resourceType);
  return revision;
}

async function listRevisions(resourceType, limit = 20) {
  const latestRaw = await CmsRevision.max("version_number", {
    where: { resource_type: resourceType },
  });
  const latest_version_number = Number(latestRaw) || 0;

  const rows = await CmsRevision.findAll({
    where: { resource_type: resourceType },
    order: [["version_number", "DESC"]],
    limit: Math.min(50, Math.max(1, limit)),
  });
  const revisions = rows.map((r) => {
    const plain = r.get({ plain: true });
    return {
      id: plain.id,
      resource_type: plain.resource_type,
      version_number: plain.version_number,
      label: plain.label || `Version ${plain.version_number}`,
      created_by: plain.created_by,
      created_by_email: plain.created_by_email,
      created_at: plain.created_at,
    };
  });

  return { revisions, latest_version_number };
}

async function getRevisionById(resourceType, revisionId) {
  return CmsRevision.findOne({
    where: { id: revisionId, resource_type: resourceType },
  });
}

async function getAfterPayloadForVersion(resourceType, versionNumber) {
  const next = await CmsRevision.findOne({
    where: { resource_type: resourceType, version_number: versionNumber + 1 },
    order: [["version_number", "ASC"]],
  });
  if (next?.payload) return next.payload;

  const row = await getSingletonRow(resourceType);
  return getSnapshotFromRow(resourceType, row);
}

async function getCmsRevisionChanges(resourceType, revisionId) {
  const revision = await getRevisionById(resourceType, revisionId);
  if (!revision) return null;

  const before = revision.payload || {};
  const after = await getAfterPayloadForVersion(resourceType, revision.version_number);
  const changes = computeRevisionChanges(before, after);

  return {
    revision: {
      id: revision.id,
      version_number: revision.version_number,
      label: revision.label || `Version ${revision.version_number}`,
      created_at: revision.created_at,
    },
    changes,
    summary:
      changes.length === 0
        ? "No field differences (or change was reverted since)."
        : `${changes.length} field${changes.length === 1 ? "" : "s"} changed in the next save`,
  };
}

/** Revert live CMS to a stored revision (archives current state first). */
async function revertToRevision(resourceType, revisionId, req) {
  const revision = await getRevisionById(resourceType, revisionId);
  if (!revision) return { ok: false, code: 404, message: "Revision not found" };

  await archiveCurrentRevision(
    resourceType,
    req,
    `Before revert to ${revision.label || `Version ${revision.version_number}`}`
  );

  const row = await getSingletonRow(resourceType);
  applySnapshotToRow(resourceType, row, revision.payload);
  await row.save();

  return { ok: true, row, revision };
}

module.exports = {
  MAX_REVISIONS,
  isValidResourceType,
  archiveCurrentRevision,
  listRevisions,
  getRevisionById,
  revertToRevision,
  getSnapshotFromRow,
  getCmsRevisionChanges,
};
