const { check } = require("express-validator");

const companyBranchValidation = {
  createCompanyBranchData: [
    check("branch_name")
      .notEmpty()
      .withMessage("Branch Name cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Branch Name exceeds maximum length"),
  //   check("companyBranchAddress")
  //     .notEmpty()
  //     .withMessage("Branch Address cannot be empty")
  //     .isLength({ max: 455 })
  //     .withMessage("Branch Address exceeds maximum length"),

  //   check("googleMapLink")
  //     .notEmpty()
  //     .withMessage("Google Map Link cannot be empty")
  //     .isLength({ max: 255 })
  //     .withMessage("Google Map Link exceeds maximum length"),
  //   check("createdBy")
  //     .exists()
  //     .withMessage("Created By is required")
  //     .notEmpty()
  //     .withMessage("Created By cannot be empty"),
  // ],
  // updateCompanyBranchData: [
    // check("companyBranchName")
    //   .notEmpty()
    //   .withMessage("Branch Name cannot be empty")
    //   .isLength({ max: 255 })
    //   .withMessage("Branch Name exceeds maximum length"),
    // check("companyBranchAddress")
    //   .notEmpty()
    //   .withMessage("Branch Address cannot be empty")
    //   .isLength({ max: 455 })
    //   .withMessage("Branch Address exceeds maximum length"),

    // check("googleMapLink")
    //   .notEmpty()
    //   .withMessage("Google Map Link cannot be empty")
    //   .isLength({ max: 255 })
    //   .withMessage("Google Map Link exceeds maximum length"),
    // check("modifiedBy")
    //   .exists()
    //   .withMessage("Modified By is required")
    //   .notEmpty()
    //   .withMessage("Modified By cannot be empty"),
  ],
};

module.exports = companyBranchValidation;
