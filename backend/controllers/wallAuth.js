const jwt = require("jsonwebtoken");
const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const { mapWallMember, normalizeEmail } = require("../helpers/wallMember");
const { signWallToken, WALL_JWT_SECRET } = require("../middlewares/wallAuth");
const { reservedCmsOperatorEmails } = require("../helpers/reservedCmsEmails");
const {
  hasWallPasswordStored,
  verifyWallPassword,
  hashWallPassword,
  validateNewPassword,
  assertPasswordConfirmation,
} = require("../helpers/wallPassword");

const RESERVED_WALL_BLOCKED = reservedCmsOperatorEmails();

async function findActiveWallMember(email) {
  if (RESERVED_WALL_BLOCKED.has(email)) {
    return { error: "reserved" };
  }

  const member = await WallMember.findOne({ where: { email } });
  if (!member) {
    return { error: "not_found" };
  }
  if (!member.is_active) {
    return { error: "inactive" };
  }
  return { member };
}

const checkEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return responseStatus(res, 400, "Email is required");
    }

    const result = await findActiveWallMember(email);
    if (result.error === "reserved") {
      return responseStatus(
        res,
        401,
        "This email is reserved for site CMS login only. Use your Refex Wall profile email."
      );
    }
    if (result.error === "not_found") {
      return responseStatus(
        res,
        404,
        "This email is not registered on The Wall. Contact your admin to be added."
      );
    }
    if (result.error === "inactive") {
      return responseStatus(res, 401, "This account is not active");
    }

    const requiresPasswordSetup = !hasWallPasswordStored(result.member.password);

    return responseStatus(res, 200, "Email recognized", {
      requiresPasswordSetup,
    });
  } catch (err) {
    console.error("wall checkEmail:", err);
    return responseStatus(res, 500, "Could not verify email");
  }
};

const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const confirmPassword =
      req.body.confirmPassword ?? req.body.confirm_password;

    if (!email) {
      return responseStatus(res, 400, "Email is required");
    }
    if (!password) {
      return responseStatus(res, 400, "Password is required");
    }

    const result = await findActiveWallMember(email);
    if (result.error === "reserved") {
      return responseStatus(
        res,
        401,
        "This email is reserved for site CMS login only. Use your Refex Wall profile email."
      );
    }
    if (result.error === "not_found") {
      return responseStatus(
        res,
        404,
        "This email is not registered on The Wall. Contact your admin to be added."
      );
    }
    if (result.error === "inactive") {
      return responseStatus(res, 401, "This account is not active");
    }

    const member = result.member;

    if (!hasWallPasswordStored(member.password)) {
      const confirmError = assertPasswordConfirmation(password, confirmPassword);
      if (confirmError) {
        return responseStatus(res, 400, confirmError);
      }

      const validationError = validateNewPassword(password);
      if (validationError) {
        return responseStatus(res, 400, validationError);
      }

      await member.update({ password: hashWallPassword(password) });
      await member.reload();

      const user = mapWallMember(member);
      const token = signWallToken(member);

      return responseStatus(res, 200, "Password created. You are signed in.", {
        user,
        token,
        passwordSetup: true,
      });
    }

    const valid = await verifyWallPassword(password, member.password);
    if (!valid) {
      return responseStatus(res, 401, "Invalid Password");
    }

    const user = mapWallMember(member);
    const token = signWallToken(member);

    return responseStatus(res, 200, "Signed in successfully", { user, token });
  } catch (err) {
    console.error("wall login:", err);
    return responseStatus(res, 500, "Login failed");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return responseStatus(res, 400, "Email is required");
    }

    if (RESERVED_WALL_BLOCKED.has(email)) {
      return responseStatus(res, 400, "This email cannot be used for Wall login");
    }

    const member = await WallMember.findOne({ where: { email } });
    if (!member || !member.is_active) {
      return responseStatus(
        res,
        200,
        "If this email is registered on The Wall, a reset link has been sent."
      );
    }

    if (!hasWallPasswordStored(member.password)) {
      return responseStatus(
        res,
        400,
        "No password is set yet. Sign in with your email and create your password on the first screen."
      );
    }

    const token = jwt.sign(
      { wallMemberId: member.id, purpose: "wall_password_reset" },
      WALL_JWT_SECRET,
      { expiresIn: "30m" }
    );

    const frontBase =
      process.env.WALL_FRONT_END_URL ||
      process.env.FRONT_END_URL ||
      req.headers.origin ||
      "http://localhost:3000";
    const encoded = encodeURIComponent(token);
    const resetPath = `/wall/reset-password?token=${encoded}`;
    const resetUrl = `${String(frontBase).replace(/\/$/, "")}${resetPath}`;

    return responseStatus(res, 200, "Password reset link created", {
      resetUrl,
      resetPath,
    });
  } catch (err) {
    console.error("wall forgotPassword:", err);
    return responseStatus(res, 500, "Could not start password reset");
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || req.query.token || "").trim();
    const { password, confirmPassword } = req.body;
    if (!token) {
      return responseStatus(res, 400, "Reset token is required");
    }
    const confirm = confirmPassword ?? req.body.confirm_password;

    if (!password || !confirm) {
      return responseStatus(res, 400, "Password and confirmation are required");
    }

    const confirmError = assertPasswordConfirmation(password, confirm);
    if (confirmError) {
      return responseStatus(res, 400, confirmError);
    }

    const validationError = validateNewPassword(password);
    if (validationError) {
      return responseStatus(res, 400, validationError);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, WALL_JWT_SECRET);
    } catch {
      return responseStatus(res, 401, "Reset link is invalid or has expired");
    }

    if (decoded.purpose !== "wall_password_reset" || !decoded.wallMemberId) {
      return responseStatus(res, 401, "Invalid reset token");
    }

    const member = await WallMember.findByPk(decoded.wallMemberId);
    if (!member || !member.is_active) {
      return responseStatus(res, 404, "Account not found or inactive");
    }

    await member.update({ password: hashWallPassword(password) });

    return responseStatus(
      res,
      200,
      "Password updated. You can sign in with your new password."
    );
  } catch (err) {
    console.error("wall resetPassword:", err);
    return responseStatus(res, 500, "Could not reset password");
  }
};

const me = async (req, res) => {
  if (!req.wallUser) {
    return responseStatus(res, 401, "Not signed in");
  }
  return responseStatus(res, 200, "Session active", { user: req.wallUser });
};

module.exports = { checkEmail, login, me, forgotPassword, resetPassword };
