const fs = require("fs");
const path = require("path");
const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const { mapWallMember, normalizeEmail } = require("../helpers/wallMember");
const { signWallToken } = require("../middlewares/wallAuth");

function reservedCmsOperatorEmails() {
  const out = new Set();
  try {
    const samplePath = path.join(__dirname, "../data/cmsAdminSample.json");
    if (fs.existsSync(samplePath)) {
      const { email } = JSON.parse(fs.readFileSync(samplePath, "utf8"));
      const n = normalizeEmail(email);
      if (n) out.add(n);
    }
  } catch {
    /* ignore */
  }
  return out;
}

const RESERVED_WALL_BLOCKED = reservedCmsOperatorEmails();

const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return responseStatus(res, 400, "Email is required");
    }

    if (RESERVED_WALL_BLOCKED.has(email)) {
      return responseStatus(
        res,
        401,
        "This email is reserved for site CMS login only. Use your Refex Wall profile email (same list as npm run seed:wall-users)."
      );
    }

    const member = await WallMember.findOne({ where: { email } });
    if (!member) {
      return responseStatus(
        res,
        401,
        "Email not found. Use your official Refex email address."
      );
    }
    if (!member.is_active) {
      return responseStatus(res, 401, "This account is not active");
    }

    const user = mapWallMember(member);
    const token = signWallToken(member);

    return responseStatus(res, 200, "Signed in successfully", { user, token });
  } catch (err) {
    console.error("wall login:", err);
    return responseStatus(res, 500, "Login failed");
  }
};

const me = async (req, res) => {
  if (!req.wallUser) {
    return responseStatus(res, 401, "Not signed in");
  }
  return responseStatus(res, 200, "Session active", { user: req.wallUser });
};

module.exports = { login, me };
