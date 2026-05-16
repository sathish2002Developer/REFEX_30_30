const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { WallMember } = require("../models");
const { responseStatus } = require("../helpers/response");
const { mapWallMember, normalizeEmail } = require("../helpers/wallMember");
const { isReservedCmsEmail } = require("../helpers/reservedCmsEmails");

function mapAdminWallMember(member) {
  const base = mapWallMember(member);
  return {
    ...base,
    team_entity: member.team_entity,
    is_active: member.is_active,
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
        members.map(mapAdminWallMember)
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
      return responseStatus(res, 200, "Wall user", mapAdminWallMember(member));
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

      const member = await WallMember.create({
        name: String(name).trim(),
        designation: String(designation || "").trim(),
        team_entity: String(teamEntity || "").trim(),
        email,
        is_active: Boolean(isActive),
      });

      return responseStatus(
        res,
        201,
        "Wall user created",
        mapAdminWallMember(member)
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
      if (req.body.isActive !== undefined) patch.is_active = Boolean(req.body.isActive);

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

      await member.update(patch);
      await member.reload();

      return responseStatus(
        res,
        200,
        "Wall user updated",
        mapAdminWallMember(member)
      );
    } catch (err) {
      console.error("updateWallMemberById:", err);
      return responseStatus(res, 500, "Failed to update wall user");
    }
  },
};

module.exports = wallMembersController;
