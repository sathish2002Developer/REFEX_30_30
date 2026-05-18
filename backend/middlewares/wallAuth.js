const jwt = require("jsonwebtoken");
const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const { mapWallMember } = require("../helpers/wallMember");

const WALL_JWT_SECRET =
  process.env.WALL_JWT_SECRET || process.env.APP_KEY || "refex-wall-secret";

exports.WALL_JWT_SECRET = WALL_JWT_SECRET;

exports.wallOptionalAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, WALL_JWT_SECRET);
    const member = await WallMember.findByPk(payload.wallMemberId);
    if (member?.is_active) {
      req.wallUser = mapWallMember(member, req);
    }
    next();
  } catch {
    next();
  }
};

exports.wallRequireAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return responseStatus(res, 401, "Please sign in with your Refex email to post");
    }
    const payload = jwt.verify(token, WALL_JWT_SECRET);
    const member = await WallMember.findByPk(payload.wallMemberId);
    if (!member || !member.is_active) {
      return responseStatus(res, 401, "Session expired. Please sign in again");
    }
    req.wallUser = mapWallMember(member, req);
    next();
  } catch {
    return responseStatus(res, 401, "Invalid or expired session. Please sign in again");
  }
};

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

exports.signWallToken = (member) =>
  jwt.sign(
    {
      wallMemberId: member.id,
      email: member.email,
      name: member.name,
    },
    WALL_JWT_SECRET,
    { expiresIn: "7d" }
  );
