const { check } = require("express-validator");

const CompanyDataValidation = {
  createCompanyData: [
    check("companyName")
      .notEmpty()
      .withMessage("Company Name cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Company Name exceeds maximum length"),
    check("companyWebSite")
      .notEmpty()
      .withMessage("Company Website cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Company Website exceeds maximum length"),
    // check("companyBranches")
    //   .exists()
    //   .withMessage("Company Branches is required")
    //   .isArray({ min: 1 })
    //   .withMessage(
    //     "Company Branches should be array and must be atleast one brach"
    //   ),
    // check("companyLogo")
    //     .notEmpty().withMessage("Company logo is required")
    //     .custom((value, { req }) => {
    //         if (!req.files || !req.files.companyLogo) {
    //             throw new Error("Company logo is required");
    //         }

    //         const photo = req.files.companyLogo;
    //         const allowedExtensions = ["jpg", "jpeg", "png"];
    //         const maxFileSize = 1 * 1024 * 1024; // 1MB

    //         if (!allowedExtensions.includes(photo.mimetype.split("/")[1]) || photo.size > maxFileSize) {
    //             throw new Error("Invalid Company logo format or size");
    //         }
    //         return true;
    //     }),
    // check("createdBy")
    //   .exists()
    //   .withMessage("Created By is required")
    //   .notEmpty()
    //   .withMessage("Created By cannot be empty"),
  ],
  updateCompanyData: [
    check("companyName")
      .notEmpty()
      .withMessage("Company Name cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Company Name exceeds maximum length"),
    check("companyWebSite")
      .notEmpty()
      .withMessage("Company Website cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Company Website exceeds maximum length"),
    check("companyBranches")
      .exists()
      .withMessage("Company Branches is required")
      .isArray({ min: 1 })
      .withMessage(
        "Company Branches should be array and must be atleast one brach"
      ),
    // check("companyLogo")
    //     .notEmpty().withMessage("Company logo is required")
    //     .custom((value, { req }) => {
    //         if (!req.files || !req.files.companyLogo) {
    //             throw new Error("Company logo is required");
    //         }

    //         const photo = req.files.companyLogo;
    //         const allowedExtensions = ["jpg", "jpeg", "png"];
    //         const maxFileSize = 1 * 1024 * 1024; // 1MB

    //         if (!allowedExtensions.includes(photo.mimetype.split("/")[1]) || photo.size > maxFileSize) {
    //             throw new Error("Invalid Company logo format or size");
    //         }
    //         return true;
    //     }),
    // check("modifiedBy")
    //   .exists()
    //   .withMessage("Modified By is required")
    //   .notEmpty()
    //   .withMessage("Modified By cannot be empty"),
  ],
};

module.exports = CompanyDataValidation;
