const { check, body } = require("express-validator");
const Type = require("../utils/userTypes");

const validation = {
  createUserSchema: [
    check("firstName").exists().withMessage("First Name is required").notEmpty().withMessage("First Name should not be empty"),
    check("lastName").exists().withMessage("Last Name is required").notEmpty().withMessage("Last Name should not be empty"),
    check("mobileNumber").exists().withMessage("Phone is required").notEmpty().withMessage("Mobile Number should not be empty"),
    check("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    // check("password")
    //   .exists()
    //   .withMessage("Password is required")
    //   .notEmpty()
    //   .isLength({ min: 6 })
    //   .withMessage("Password must contain at least 6 characters"),
    check("userType")
      .optional()
      .isIn([Type.SuperAdmin, Type.Admin, Type.User])
      .withMessage("Invalid Role type"),
  ],
  updateUserSchema: [
    check("firstName").optional().notEmpty().withMessage("First Name should not be empty"),
    check("lastName").optional().notEmpty().withMessage("Last Name should not be empty"),
    check("mobileNumber").optional().notEmpty().withMessage("Mobile Number should not be empty"),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must contain at least 6 characters"),
    check("userType")
      .optional()
      .isIn([Type.SuperAdmin, Type.Admin, Type.User])
      .withMessage("Invalid Role type"),
    check("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  validateLogin: [
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.username) {
        throw new Error("Either email or username is required");
      }
      return true;
    }),
    check("email")
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("username")
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage("Username must be a valid email")
      .normalizeEmail(),
    check("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password must be filled"),
  ],
};

module.exports = validation;
