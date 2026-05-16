const { check } = require("express-validator");

const employeeDataValidation = {
  createEmployeeData: [
    // check("employeeCompanyId")
    // .exists()
    // .withMessage("Company Id is required")
    // .notEmpty()
    // .withMessage("Company Id cannot be empty"),

    // check("employeeBranchId")
    // .exists()
    // .withMessage("Branch Id is required")
    // .notEmpty()
    // .withMessage("Branch Id cannot be empty"),

    check("employeeId")
      .notEmpty()
      .withMessage("Employee ID cannot be empty")
      .isLength({ max: 15 })
      .withMessage("Employee ID exceeds maximum length"),
    // check("employeePhoto")
    //     .notEmpty().withMessage("Employee Photo is required")
    //     .custom((value, { req }) => {
    //         if (!req.files || !req.files.employeePhoto) {
    //             throw new Error("Employee Photo is required");
    //         }

    //         const photo = req.files.employeePhoto;
    //         const allowedExtensions = ["jpg", "jpeg", "png"];
    //         const maxFileSize = 1 * 1024 * 1024; // 1MB

    //         if (!allowedExtensions.includes(photo.mimetype.split("/")[1]) || photo.size > maxFileSize) {
    //             throw new Error("Invalid Employee Photo format or size");
    //         }
    //         return true;
    //     }),
    check("employeeName")
      .notEmpty()
      .withMessage("Employee Name cannot be empty")
      .isLength({ max: 455 })
      .withMessage("Employee Name exceeds maximum length"),
    check("designation")
      // .notEmpty()
      // .withMessage("Employee Designation cannot be empty")
      .optional()
      .isLength({ max: 455 })
      .withMessage("Employee Designation exceeds maximum length"),
    check("mobileNumber")
      // .notEmpty()
      // .withMessage("Mobile Number is required")
      .optional()
      // .isInt()
      // .withMessage("Mobile Number must be an integer")
      .isLength({ max: 15 })
      .withMessage("Mobile Number cannot exceed 15 digits"),
    check("landline")
      .optional()
      .isLength({ max: 95 })
      .withMessage("Employee Landline exceeds maximum length"),
    check("email")
      .notEmpty()
      .withMessage("Employee Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    check("companyId")
      .exists()
      .withMessage("Company Id is required")
      .notEmpty()
      .withMessage("Company Id cannot be empty"),
    check("branchId")
      .exists()
      .withMessage("Branch Id is required")
      .notEmpty()
      .withMessage("Branch Id cannot be empty"),
    // check("createdBy")
    //   .exists()
    //   .withMessage("Created By is required")
    //   .notEmpty()
    //   .withMessage("Created By cannot be empty"),
  ],
  updateEmployeeData: [
    // check("employeeCompanyId")
    // .exists()
    // .withMessage("Company Id is required")
    // .notEmpty()
    // .withMessage("Company Id cannot be empty"),

    // check("employeeBranchId")
    // .exists()
    // .withMessage("Branch Id is required")
    // .notEmpty()
    // .withMessage("Branch Id cannot be empty"),

    check("employeeId")
      .notEmpty()
      .withMessage("Employee ID cannot be empty")
      .isLength({ max: 15 })
      .withMessage("Employee ID exceeds maximum length"),
    // check("employeePhoto")
    //     .notEmpty().withMessage("Employee Photo is required")
    //     .custom((value, { req }) => {
    //         if (!req.files || !req.files.employee_photo) {
    //             throw new Error("Employee Photo is required");
    //         }

    //         const photo = req.files.employee_photo;
    //         const allowedExtensions = ["jpg", "jpeg", "png"];
    //         const maxFileSize = 1 * 1024 * 1024; // 1MB

    //         if (!allowedExtensions.includes(photo.mimetype.split("/")[1]) || photo.size > maxFileSize) {
    //             throw new Error("Invalid Employee Photo format or size");
    //         }
    //         return true;
    //     }),
    check("employeeName")
      .notEmpty()
      .withMessage("Employee Name cannot be empty")
      .isLength({ max: 455 })
      .withMessage("Employee Name exceeds maximum length"),
    check("designation")
      // .notEmpty()
      // .withMessage("Employee Designation cannot be empty")
      .optional()
      .isLength({ max: 455 })
      .withMessage("Employee Designation exceeds maximum length"),
    check("mobileNumber")
      // .notEmpty()
      // .withMessage("Mobile Number is required")
      .optional()
      // .isInt()
      // .withMessage("Mobile Number must be an integer")
      .isLength({ max: 15 })
      .withMessage("Mobile Number cannot exceed 15 digits"),
    check("landline")
      .optional()
      .isLength({ max: 95 })
      .withMessage("Employee Landline exceeds maximum length"),
    check("email")
      .notEmpty()
      .withMessage("Employee Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    check("companyId")
      .exists()
      .withMessage("Company Id is required")
      .notEmpty()
      .withMessage("Company Id cannot be empty"),
    check("branchId")
      .exists()
      .withMessage("Branch Id is required")
      .notEmpty()
      .withMessage("Branch Id cannot be empty"),
    // check("modifiedBy")
    //   .exists()
    //   .withMessage("Modified By is required")
    //   .notEmpty()
    //   .withMessage("Modified By cannot be empty"),
  ],
};

module.exports = employeeDataValidation;
