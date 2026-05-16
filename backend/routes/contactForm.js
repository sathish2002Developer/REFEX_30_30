const express = require('express');
const { body, validationResult } = require('express-validator');

const emailService = require('../services/email_service');
const { sendToKissflowWebhook } = require('../helpers/kissflowWebhook');
const { getRequestMeta, phoneToDigitsOnly } = require('../helpers/requestMeta');
const { isValidInternationalPhone } = require('../helpers/phoneValidation');

const router = express.Router();

// Practical email format (local@domain.tld)
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

router.post(
  '/contact-form',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 2, max: 120 })
      .withMessage('name must be between 2 and 120 characters')
      .matches(/^[\p{L}\p{M}\s'.-]+$/u)
      .withMessage('name contains invalid characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .matches(EMAIL_REGEX)
      .withMessage('valid email is required'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('phone is required')
      .custom((value) => {
        if (!isValidInternationalPhone(value)) {
          throw new Error('phone is invalid');
        }
        return true;
      }),
    body('company').optional().isString(),
    body('message').trim().notEmpty().withMessage('message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const arr = errors.array();
      const fieldLabels = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        company: 'Company',
        message: 'Message',
      };
      const errorMessages = arr.map((e) => {
        const label = fieldLabels[e.path] || e.path;
        return `${label}: ${e.msg}`;
      });
      return res.status(400).json({
        success: false,
        message: errorMessages.join(' '),
        errorMessages,
        errors: arr,
      });
    }

    const { name, email, phone, company, message } = req.body || {};

    const meta = getRequestMeta(req);
    const phoneDigits = phoneToDigitsOnly(phone);

    const websiteName = 'Refex Mobility';
    const webhookData = {
      name,
      email,
      phone: phoneDigits,
      Phone_Number: phoneDigits,
      company,
      message,
      ...meta,
    };

    // Queue Kissflow webhook asynchronously (do not await)
    sendToKissflowWebhook(websiteName, 'Contact form', webhookData);

    // let emailSent = false;
    // try {
    //   // Send email (existing implementation)
    //   await emailService.sendContactFormEmail({
    //     name,
    //     email,
    //     phone: phoneDigits || phone,
    //     company,
    //     message,
    //     ipAddress: meta.ipAddress,
    //   });
    //   emailSent = true;

    //   // Auto-reply is optional; don't fail the main response if it fails
    //   try {
    //     await emailService.sendAutoReply(email, name);
    //   } catch (err) {
    //     console.error('Contact form auto-reply failed', { message: err?.message });
    //   }
    // } catch (error) {
    //   console.error('Contact form email failed', error);
    // }

    const emailSent = false;

    return res.json({
      success: true,
      message: 'Contact form submitted successfully',
      emailSent,
    });
  }
);

module.exports = router;

