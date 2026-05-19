const { WallMemberRevision, WallMember, User } = require("../models");
const { hasWallPasswordStored } = require("./wallPassword");
const { computeRevisionChanges } = require("./revisionDiff");

const MAX_REVISIONS_PER_MEMBER = 50;

const SNAPSHOT_KEYS = [
  "name",
  "designation",
  "team_entity",
  "email",
  "is_active",
  "avatar_url",
];

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function snapshotFromMember(member) {
  const plain = member.get({ plain: true });
  const out = {};
  for (const k of SNAPSHOT_KEYS) {
    if (plain[k] !== undefined) out[k] = cloneJson(plain[k]);
  }
  out.had_password = hasWallPasswordStored(plain.password);
  return out;
}

function applySnapshotToMember(member, snapshot) {
  for (const k of SNAPSHOT_KEYS) {
    if (snapshot[k] !== undefined) member[k] = cloneJson(snapshot[k]);
  }
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
      /* optional */
    }
  }
  return { created_by: id, created_by_email: email };
}

async function nextVersionNumber(wallMemberId) {
  const max = await WallMemberRevision.max("version_number", {
    where: { wall_member_id: wallMemberId },
  });
  return (Number(max) || 0) + 1;
}

async function trimOldRevisions(wallMemberId) {
  const rows = await WallMemberRevision.findAll({
    where: { wall_member_id: wallMemberId },
    order: [["version_number", "DESC"]],
    attributes: ["id"],
    offset: MAX_REVISIONS_PER_MEMBER,
  });
  if (!rows.length) return;
  await WallMemberRevision.destroy({ where: { id: rows.map((r) => r.id) } });
}

/** Archive member state before an update, password reset, or status toggle. */
async function archiveWallMemberRevision(member, req, label) {
  const wallMemberId = member.id;
  const version = await nextVersionNumber(wallMemberId);
  const actor = await actorFromReq(req);
  const revision = await WallMemberRevision.create({
    wall_member_id: wallMemberId,
    version_number: version,
    payload: snapshotFromMember(member),
    label: label || `Version ${version}`,
    ...actor,
  });
  await trimOldRevisions(wallMemberId);
  return revision;
}

async function listMemberRevisions(wallMemberId, limit = 20) {
  const latestRaw = await WallMemberRevision.max("version_number", {
    where: { wall_member_id: wallMemberId },
  });
  const latest_version_number = Number(latestRaw) || 0;

  const rows = await WallMemberRevision.findAll({
    where: { wall_member_id: wallMemberId },
    order: [["version_number", "DESC"]],
    limit: Math.min(50, Math.max(1, limit)),
  });
  const revisions = rows.map((r) => {
    const plain = r.get({ plain: true });
    return {
      id: plain.id,
      wall_member_id: plain.wall_member_id,
      version_number: plain.version_number,
      label: plain.label || `Version ${plain.version_number}`,
      created_by: plain.created_by,
      created_by_email: plain.created_by_email,
      created_at: plain.created_at,
    };
  });

  return { revisions, latest_version_number };
}

async function getAfterPayloadForMemberVersion(wallMemberId, versionNumber) {
  const next = await WallMemberRevision.findOne({
    where: { wall_member_id: wallMemberId, version_number: versionNumber + 1 },
  });
  if (next?.payload) return next.payload;

  const member = await WallMember.findByPk(wallMemberId);
  if (!member) return {};
  return snapshotFromMember(member);
}

async function getWallMemberRevisionChanges(wallMemberId, revisionId) {
  const revision = await WallMemberRevision.findOne({
    where: { id: revisionId, wall_member_id: wallMemberId },
  });
  if (!revision) return null;

  const before = revision.payload || {};
  const after = await getAfterPayloadForMemberVersion(wallMemberId, revision.version_number);
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
        ? "No profile differences since this version."
        : `${changes.length} field${changes.length === 1 ? "" : "s"} changed in the next update`,
  };
}

async function revertMemberToRevision(member, revisionId, req) {
  const revision = await WallMemberRevision.findOne({
    where: { id: revisionId, wall_member_id: member.id },
  });
  if (!revision) return { ok: false, code: 404, message: "Revision not found" };

  await archiveWallMemberRevision(
    member,
    req,
    `Before revert to ${revision.label || `Version ${revision.version_number}`}`
  );

  applySnapshotToMember(member, revision.payload);
  await member.save();

  return { ok: true, revision };
}

module.exports = {
  archiveWallMemberRevision,
  listMemberRevisions,
  revertMemberToRevision,
  snapshotFromMember,
  getWallMemberRevisionChanges,
};
