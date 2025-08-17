# Email Configuration Guide for Forgot Password Functionality

## Problem
The forgot password feature shows "link has been sent" but emails are not being received because email service is not properly configured.

## Solutions

### Option 1: Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"
3. **Update your .env file**:

```env
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Your Real Estate Platform"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
```

### Option 2: Hostinger Email (For Production)

If you have a domain with Hostinger:

```env
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Real Estate Platform"
EMAIL_HOST="smtp.hostinger.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-email-password"
```

### Option 3: SendGrid (Professional Solution)

1. **Sign up for SendGrid** (free tier available)
2. **Get API Key** from SendGrid dashboard
3. **Update .env file**:

```env
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Real Estate Platform"
```

### Option 4: Development Mode (Console Logging)

For testing without actual email sending:

```env
EMAIL_PROVIDER="console"
EMAIL_FROM="test@example.com"
EMAIL_FROM_NAME="Test Platform"
```

## Testing Email Configuration

After updating your .env file, restart your development server and test the forgot password functionality.

## Troubleshooting

1. **Gmail "Less secure app access"** - Use App Passwords instead
2. **Hostinger emails not sending** - Check domain email settings in cPanel
3. **Port 587 blocked** - Try port 465 with EMAIL_SECURE="true"
4. **Firewall issues** - Ensure SMTP ports are not blocked

## Current Configuration Status

Your current .env has placeholder values:
- EMAIL_USER="your-email@yourdomain.com" ❌
- EMAIL_PASS="your-email-password" ❌
- EMAIL_FROM="noreply@yourdomain.com" ❌

These need to be replaced with actual credentials.