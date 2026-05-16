const { check } = require("express-validator");

const createWallMemberSchema = [
  check("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name should not be empty")
    .isLength({ max: 120 })
    .withMessage("Name must be at most 120 characters"),
  check("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  check("designation")
    .optional({ nullable: true })
    .isLength({ max: 160 })
    .withMessage("Designation must be at most 160 characters"),
  check("teamEntity")
    .optional({ nullable: true })
    .isLength({ max: 160 })
    .withMessage("Team / entity must be at most 160 characters"),
  check("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

const updateWallMemberSchema = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name should not be empty")
    .isLength({ max: 120 })
    .withMessage("Name must be at most 120 characters"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),
  check("designation")
    .optional({ nullable: true })
    .isLength({ max: 160 })
    .withMessage("Designation must be at most 160 characters"),
  check("teamEntity")
    .optional({ nullable: true })
    .isLength({ max: 160 })
    .withMessage("Team / entity must be at most 160 characters"),
  check("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

module.exports = {
  createWallMemberSchema,
  updateWallMemberSchema,
};
