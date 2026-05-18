const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const {
  mapWallMember,
  normalizeEmail,
  resolveMemberAvatar,
} = require("../helpers/wallMember");

function parseBoolField(value, defaultValue = true) {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return Boolean(value);
}

function avatarStoragePath(filename) {
  return `/uploads/wall/avatars/${filename}`;
}
const { isReservedCmsEmail } = require("../helpers/reservedCmsEmails");
const {
  hashWallPassword,
  validateNewPassword,
  hasWallPasswordStored,
} = require("../helpers/wallPassword");

function mapAdminWallMember(member, req) {
  const base = mapWallMember(member, req);
  return {
    ...base,
    team_entity: member.team_entity,
    is_active: member.is_active,
    has_password: hasWallPasswordStored(member.password),
    avatar_resolved_url: resolveMemberAvatar(req, member.avatar_url),
    created_at: member.created_at,
    updated_at: member.updated_at,
  };
}

const wallMembersController = {
  listWallMembers: async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      const activeOnly = req.query.active === "true";
      const where = {};

      if (activeOnly) where.is_active = true;
      if (q) {
        const like = `%${q}%`;
        where[Op.or] = [
          { name: { [Op.like]: like } },
          { email: { [Op.like]: like } },
          { designation: { [Op.like]: like } },
          { team_entity: { [Op.like]: like } },
        ];
      }

      const members = await WallMember.findAll({
        where,
        order: [
          ["is_active", "DESC"],
          ["name", "ASC"],
        ],
      });

      return responseStatus(
        res,
        200,
        "Wall users",
        members.map((m) => mapAdminWallMember(m, req))
      );
    } catch (err) {
      console.error("listWallMembers:", err);
      return responseStatus(res, 500, "Failed to load wall users");
    }
  },

  getWallMemberById: async (req, res) => {
    try {
      const member = await WallMember.findByPk(req.params.id);
      if (!member) {
        return responseStatus(res, 404, "Wall user not found");
      }
      return responseStatus(res, 200, "Wall user", mapAdminWallMember(member, req));
    } catch (err) {
      console.error("getWallMemberById:", err);
      return responseStatus(res, 500, "Failed to load wall user");
    }
  },

  createWallMember: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseStatus(res, 400, "Validation failed", errors);
      }

      const { name, designation = "", teamEntity = "", isActive = true } = req.body;
      const email = normalizeEmail(req.body.email);
      if (!email) {
        return responseStatus(res, 400, "Email is required");
      }
      if (isReservedCmsEmail(email)) {
        return responseStatus(
          res,
          409,
          "This email is reserved for site CMS login only"
        );
      }

      const existing = await WallMember.findOne({ where: { email } });
      if (existing) {
        return responseStatus(res, 409, "Email already exists");
      }

      let passwordHash = null;
      if (req.body.password != null && String(req.body.password).trim() !== "") {
        const validationError = validateNewPassword(req.body.password);
        if (validationError) {
          return responseStatus(res, 400, validationError);
        }
        passwordHash = hashWallPassword(req.body.password);
      }

      const member = await WallMember.create({
        name: String(name).trim(),
        designation: String(designation || "").trim(),
        team_entity: String(teamEntity || "").trim(),
        email,
        is_active: parseBoolField(isActive, true),
        password: passwordHash,
      });

      if (req.file) {
        member.avatar_url = avatarStoragePath(req.file.filename);
        await member.save();
      }

      return responseStatus(
        res,
        201,
        passwordHash
          ? "Wall user created with password"
          : "Wall user created — they will set a password on first sign-in",
        mapAdminWallMember(member, req)
      );
    } catch (err) {
      console.error("createWallMember:", err);
      return responseStatus(res, 500, "Failed to create wall user");
    }
  },

  updateWallMemberById: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseStatus(res, 400, "Validation failed", errors);
      }

      const member = await WallMember.findByPk(req.params.id);
      if (!member) {
        return responseStatus(res, 404, "Wall user not found");
      }

      const patch = {};
      if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
      if (req.body.designation !== undefined) {
        patch.designation = String(req.body.designation || "").trim();
      }
      if (req.body.teamEntity !== undefined) {
        patch.team_entity = String(req.body.teamEntity || "").trim();
      }
      if (req.body.isActive !== undefined) {
        patch.is_active = parseBoolField(req.body.isActive, member.is_active);
      }

      if (req.body.removeAvatar === true || req.body.removeAvatar === "true") {
        patch.avatar_url = null;
      }

      if (req.file) {
        patch.avatar_url = avatarStoragePath(req.file.filename);
      }

      let clearedPassword = false;
      if (parseBoolField(req.body.resetPassword, false)) {
        patch.password = null;
        clearedPassword = true;
      }

      if (req.body.email !== undefined) {
        const email = normalizeEmail(req.body.email);
        if (!email) {
          return responseStatus(res, 400, "Email is required");
        }
        if (isReservedCmsEmail(email)) {
          return responseStatus(
            res,
            409,
            "This email is reserved for site CMS login only"
          );
        }
        if (email !== member.email) {
          const dup = await WallMember.findOne({ where: { email } });
          if (dup) {
            return responseStatus(res, 409, "Email already exists");
          }
        }
        patch.email = email;
      }

      if (Object.keys(patch).length === 0) {
        return responseStatus(res, 400, "No changes to save");
      }

      await member.update(patch);
      await member.reload();

      return responseStatus(
        res,
        200,
        clearedPassword
          ? "Password cleared — user will create a new password on next sign-in"
          : "Wall user updated",
        mapAdminWallMember(member, req)
      );
    } catch (err) {
      console.error("updateWallMemberById:", err);
      return responseStatus(res, 500, "Failed to update wall user");
    }
  },
};

module.exports = wallMembersController;
