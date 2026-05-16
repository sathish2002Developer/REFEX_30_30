const emailService = require('../services/email_service');
const { responseStatus } = require('../helpers/response');
const { getRequestMeta, phoneToDigitsOnly } = require('../helpers/requestMeta');
const { sendToKissflowWebhook } = require('../helpers/kissflowWebhook');

// Submit business commute form
const submitBusinessCommuteForm = async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      department,
      regions,
      numberOfEmployees,
      comment,
      recaptchaToken
    } = req.body;

    // Validation is handled in routes/businessCommute.js (express-validator)

    // Get client IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Prepare form data
    const formData = {
      name,
      companyName,
      email,
      phone,
      department,
      regions: Array.isArray(regions) ? regions : (regions ? [regions] : []),
      numberOfEmployees,
      comment: comment || '',
      recaptchaToken,
      ipAddress
    };
    console.log(formData);

    const meta = getRequestMeta(req);
    const phoneDigits = phoneToDigitsOnly(phone);

    const websiteName = 'Refex Mobility';
    const webhookData = {
      name,
      email,
      phone: phoneDigits,
      Phone_Number: phoneDigits,
      company:companyName,
      message:comment,
      ...meta,
    };

    // Queue Kissflow webhook asynchronously (do not await)
    sendToKissflowWebhook(websiteName, 'Contact form', webhookData);

    // Send email
    const result = await emailService.sendBusinessCommuteEmail(formData);

    return responseStatus(res, 200, 'Form submitted successfully. We will contact you soon.', {
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error in submitBusinessCommuteForm:', error);
    
    // Provide user-friendly error message
    let errorMessage = 'Failed to submit form. Please try again later.';
    
    if (error.message && !error.message.includes('Email configuration error')) {
      errorMessage = error.message;
    } else if (error.message) {
      // For email configuration errors, use generic message for users
      errorMessage = 'Form submission received, but there was an issue sending the email. Our team has been notified.';
    }
    
    return responseStatus(res, 500, errorMessage);
  }
};

module.exports = {
  submitBusinessCommuteForm
};

