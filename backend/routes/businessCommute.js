const express = require('express');
const { body, validationResult } = require('express-validator');
const businessCommuteController = require('../controllers/businessCommute');
const { isValidInternationalPhone } = require('../helpers/phoneValidation');

const router = express.Router();

// Same practical email pattern as contact form
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const formatValidationErrorResponse = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return true;
  }
  const arr = errors.array();
  const errorMessages = arr.map((e) => e.msg);
  return res.status(400).json({
    success: false,
    message: errorMessages.join(' '),
    errorMessages,
    errors: arr,
  });
};

router.post(
  '/submit',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .bail()
      .isLength({ min: 2, max: 120 })
      .withMessage('name is invalid')
      .bail()
      .matches(/^[\p{L}\p{M}\s'.-]+$/u)
      .withMessage('name is invalid'),
    body('companyName')
      .trim()
      .notEmpty()
      .withMessage('company name is required')
      .bail()
      .isLength({ min: 1, max: 200 })
      .withMessage('company name is invalid'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .bail()
      .matches(EMAIL_REGEX)
      .withMessage('email is invalid'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('phone number is required')
      .bail()
      .custom((value) => {
        if (!isValidInternationalPhone(value)) {
          throw new Error('phone number is invalid');
        }
        return true;
      }),
    body('department')
      .trim()
      .notEmpty()
      .withMessage('department is required'),
    body('regions').custom((value) => {
      if (value === undefined || value === null) {
        throw new Error('regions is required');
      }
      const list = Array.isArray(value) ? value : value ? [value] : [];
      const cleaned = list.map((v) => String(v).trim()).filter(Boolean);
      if (cleaned.length === 0) {
        throw new Error('regions is required');
      }
      return true;
    }),
    body('numberOfEmployees').custom((value) => {
      const s = value === undefined || value === null ? '' : String(value).trim();
      if (!s) {
        throw new Error('number of employees is required');
      }
      return true;
    }),
  ],
  (req, res, next) => {
    if (formatValidationErrorResponse(req, res) !== true) {
      return;
    }
    next();
  },
  businessCommuteController.submitBusinessCommuteForm
);

module.exports = router;
