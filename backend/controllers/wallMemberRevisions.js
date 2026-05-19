const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const { mapAdminWallMember } = require("./wallMembers");
const {
  listMemberRevisions,
  revertMemberToRevision,
  getWallMemberRevisionChanges,
} = require("../helpers/wallMemberRevisionHelper");

const listWallMemberRevisions = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    if (!memberId) return responseStatus(res, 400, "Invalid member id");

    const member = await WallMember.findByPk(memberId);
    if (!member) return responseStatus(res, 404, "Wall user not found");

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { revisions, latest_version_number } = await listMemberRevisions(memberId, limit);
    return responseStatus(res, 200, "OK", { revisions, latest_version_number });
  } catch (e) {
    console.error("listWallMemberRevisions:", e);
    return responseStatus(res, 500, "Failed to list revisions");
  }
};

const revertWallMemberRevision = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const revisionId = parseInt(req.params.revisionId, 10);
    if (!memberId || !revisionId) {
      return responseStatus(res, 400, "Invalid id");
    }

    const member = await WallMember.findByPk(memberId);
    if (!member) return responseStatus(res, 404, "Wall user not found");

    const result = await revertMemberToRevision(member, revisionId, req);
    if (!result.ok) {
      return responseStatus(res, result.code || 404, result.message || "Not found");
    }

    await member.reload();
    const label = result.revision.label || `Version ${result.revision.version_number}`;
    return responseStatus(
      res,
      200,
      `Reverted to ${label}. Password was not changed.`,
      mapAdminWallMember(member, req)
    );
  } catch (e) {
    console.error("revertWallMemberRevision:", e);
    return responseStatus(res, 500, "Failed to revert");
  }
};

const getWallMemberRevisionChangesHandler = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    const revisionId = parseInt(req.params.revisionId, 10);
    if (!memberId || !revisionId) {
      return responseStatus(res, 400, "Invalid id");
    }

    const member = await WallMember.findByPk(memberId);
    if (!member) return responseStatus(res, 404, "Wall user not found");

    const data = await getWallMemberRevisionChanges(memberId, revisionId);
    if (!data) return responseStatus(res, 404, "Revision not found");

    return responseStatus(res, 200, "OK", data);
  } catch (e) {
    console.error("getWallMemberRevisionChangesHandler:", e);
    return responseStatus(res, 500, "Failed to load changes");
  }
};

module.exports = {
  listWallMemberRevisions,
  revertWallMemberRevision,
  getWallMemberRevisionChangesHandler,
};
