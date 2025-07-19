# 📧 Email Setup Guide for Forgot Password

This guide will help you configure email functionality for the forgot password feature in your real estate platform.

## ✅ What's Already Implemented

- ✅ Complete forgot password flow
- ✅ Password reset email template
- ✅ Token generation and validation
- ✅ Email service integration
- ✅ Security best practices

## 🛠️ Setup Instructions

### 1. Environment Variables Setup

Copy the `.env.example` file to `.env` and update the email configuration:

```bash
cp .env.example .env
```

Edit your `.env` file with the following email settings:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME="Real Estate Platform"
```

### 2. Gmail Configuration (Recommended)

For Gmail accounts, follow these steps:

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

#### Step 2: Generate App Password
1. Go to Security > 2-Step Verification > App passwords
2. Select "Mail" and "Other (custom name)"
3. Enter "Real Estate Platform" as the name
4. Copy the generated 16-character password
5. Use this password as `EMAIL_PASS` (not your regular Gmail password)

#### Step 3: Update Environment Variables
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # 16-character app password
EMAIL_FROM=youremail@gmail.com
EMAIL_FROM_NAME="Your Company Name"
```

### 3. Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Custom SMTP Server
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_SECURE=false  # true for port 465
```

### 4. Test Your Configuration

Use the test endpoint to verify your email setup:

```bash
# Test basic email
curl -X POST http://localhost:3003/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com", "type": "test"}'

# Test password reset email
curl -X POST http://localhost:3003/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com", "type": "reset"}'
```

## 🔄 How It Works

### 1. User Requests Password Reset
- User visits `/forgot-password`
- Enters their email address
- System generates secure reset token (32 bytes, hex)
- Token expires in 24 hours

### 2. Email Sent
- Professional HTML email template
- Contains secure reset link
- Includes security warnings and instructions
- Falls back to console logging if email fails

### 3. User Clicks Reset Link
- Link format: `/reset-password?token=abc123...`
- Token is validated server-side
- User can set new password
- Token is invalidated after use

### 4. Password Updated
- New password is securely hashed
- Reset token is cleared from database
- User can login with new password

## 🔒 Security Features

- **Secure Token Generation**: 32-byte cryptographically secure tokens
- **Time-Limited**: Tokens expire in 24 hours
- **Single Use**: Tokens are invalidated after password reset
- **No Information Disclosure**: Same response for valid/invalid emails
- **Rate Limiting**: Admin rate limits apply to prevent abuse
- **Password Requirements**: Minimum 6 characters enforced

## 📱 Email Template Features

- **Responsive Design**: Works on all devices
- **Professional Styling**: Branded email appearance
- **Clear Call-to-Action**: Prominent reset button
- **Security Warnings**: User education about security
- **Fallback Text**: Plain text version included
- **Company Branding**: Customizable company name and styling

## 🚨 Production Considerations

### Environment Variables
```env
# Production settings
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
EMAIL_FROM_NAME="Your Company Name"
```

### Email Monitoring
- Monitor email delivery rates
- Set up bounce handling
- Implement email analytics
- Consider using dedicated email services (SendGrid, AWS SES)

### Performance
- Email sending is asynchronous
- No user blocking during email send
- Graceful fallback if email fails
- Console logging for debugging

## 🧪 Testing Scenarios

1. **Valid Email Test**
   - Use existing user email
   - Check email inbox
   - Verify reset link works

2. **Invalid Email Test**
   - Use non-existent email
   - Should still show success message (security)
   - No email should be sent

3. **Expired Token Test**
   - Wait 24 hours after reset request
   - Token should be invalid

4. **Used Token Test**
   - Use reset token once
   - Try using same token again
   - Should fail on second attempt

## 📞 Troubleshooting

### Common Issues

#### "Email configuration is invalid"
- Check EMAIL_USER and EMAIL_PASS are set
- Verify app password is correct (for Gmail)
- Test SMTP settings with email client

#### "Failed to send email"
- Check internet connectivity
- Verify SMTP server settings
- Check firewall/proxy settings
- Try different EMAIL_PORT (587 vs 465)

#### "Invalid or expired reset token"
- Token may have expired (24 hours)
- Token may have been used already
- Check token in URL is complete

### Debug Mode
Set NODE_ENV=development to see reset URLs in console logs when email fails.

## 🎯 Next Steps

1. Configure your email settings in `.env`
2. Test with the `/api/test-email` endpoint
3. Try the full forgot password flow
4. Customize email template styling if needed
5. Set up production email service for scale

---

**Need Help?** Check the console logs for detailed error messages and reset URLs during development.