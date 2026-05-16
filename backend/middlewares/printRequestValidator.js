const { check } = require("express-validator");

const PrintRequestValidation = {
  parsePR: (req, res, next) => {
    if (req.body.printEmployees) {
      try {
        req.body.printEmployees = JSON.parse(req.body.printEmployees);
      } catch (err) {
        return res.status(400).json({
          status: false,
          status_code: 400,
          message:
            "Invalid format for printEmployees. Must be a valid JSON array.",
        });
      }
    }
    next();
  },
  createPrintRequest: [
    // check("printEmployees")
    //   .exists()
    //   .withMessage("Print Employees is required")
    //   .isArray({ min: 1 })
    //   .withMessage(
    //     "Print Employees should be array and must be atleast one brach"
    //   ),
    // check("createdBy")
    // .exists()
    // .withMessage("Created By is required")
    // .notEmpty()
    // .withMessage("Created By cannot be empty"),
  ],
};

module.exports = PrintRequestValidation;
