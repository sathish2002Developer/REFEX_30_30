# Email Setup Instructions

## Contact Form Email Configuration

The contact form now sends emails to `info@refex.co.in` when submitted. Follow these steps to configure email functionality:

### 1. Environment Variables Setup

Create a `.env` file in the `server` directory with the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
APP_PORT=8080
NODE_ENV=development
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

### 3. Alternative Email Providers

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### 4. Testing Email Service

Test the email configuration by visiting:
```
GET /api/test-email
```

### 5. Contact Form API Endpoint

The contact form now uses:
```
POST /api/contact-form
```

### 6. Features Implemented

✅ **Server-side email sending** using Nodemailer
✅ **Professional HTML email templates**
✅ **Auto-reply to customers**
✅ **Form validation** on server-side
✅ **reCAPTCHA verification**
✅ **IP address logging**
✅ **Error handling and logging**

### 7. Email Templates

- **Main Email**: Sent to `info@refex.co.in` with all form details
- **Auto-reply**: Sent to customer confirming receipt
- **Professional styling** with company branding

### 8. Security Features

- Input validation and sanitization
- reCAPTCHA verification
- Rate limiting (can be added)
- IP address logging for security

### 9. Troubleshooting

If emails are not sending:

1. Check SMTP credentials
2. Verify firewall settings
3. Check spam folder
4. Test with `/api/test-email` endpoint
5. Check server logs for errors

### 10. Production Deployment

For production:
1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Set up proper DNS records (SPF, DKIM)
3. Monitor email delivery rates
4. Set up email bounce handling

