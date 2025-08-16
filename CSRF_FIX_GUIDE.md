# CSRF Error Fix Guide for Hostinger Deployment

## Issue Description
The CSRF (Cross-Site Request Forgery) error occurs when the application tries to validate security tokens but the configuration is not properly set up for production.

## Required Environment Variables

Update your `.env.production` file or set these environment variables in your Hostinger deployment:

```bash
# CSRF Secret (generate a random 32+ character string)
CSRF_SECRET="your-unique-csrf-secret-32-chars-minimum-here"

# Site URL (replace with your actual domain)
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"

# JWT Secret (if not already set)
JWT_SECRET="your-jwt-secret-key-32-chars-minimum"

# NextAuth Secret (if not already set)  
NEXTAUTH_SECRET="your-production-secret-key-32-chars-minimum"
```

## Steps to Fix on Hostinger

### 1. Update Environment Variables
In your Hostinger cPanel or through your deployment script:

```bash
# Set the CSRF secret
export CSRF_SECRET="$(openssl rand -hex 32)"

# Set your domain URL
export NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
export NEXTAUTH_URL="https://yourdomain.com"
```

### 2. Generate Secure Secrets
Use these commands to generate secure secrets:

```bash
# For CSRF_SECRET
openssl rand -hex 32

# For JWT_SECRET  
openssl rand -hex 32

# For NEXTAUTH_SECRET
openssl rand -hex 32
```

### 3. Restart Your Application
After updating environment variables, restart your Next.js application:

```bash
# If using PM2
pm2 restart your-app-name

# If using direct node
killall node
npm run start:production
```

### 4. Test the Fix
1. Visit your website
2. Try to perform any action that requires form submission (login, contact form, etc.)
3. The CSRF error should be resolved

## For Development
If you need to disable CSRF validation temporarily during development, add this to your `.env.local`:

```bash
SKIP_CSRF_IN_DEV=true
```

## Client-Side Usage
Use the new CSRF helper functions in your frontend code:

```javascript
import { makeAuthenticatedRequest } from '@/lib/csrf-client';

// Make API calls with automatic CSRF token handling
const response = await makeAuthenticatedRequest('/api/your-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Troubleshooting

### Still Getting CSRF Errors?
1. Check that all environment variables are set correctly
2. Ensure your domain name in `NEXT_PUBLIC_SITE_URL` matches exactly
3. Clear browser cookies and try again
4. Check browser developer tools for any CORS errors
5. Verify the application restarted after environment variable changes

### Browser Shows "Invalid or missing CSRF token"
1. Open browser developer tools
2. Go to Application/Storage > Cookies
3. Delete all cookies for your domain
4. Refresh the page
5. Try the action again

## Files Modified
- `.env.production` - Added CSRF configuration
- `src/app/api/csrf/route.ts` - Improved cookie settings
- `src/lib/csrf.ts` - Enhanced token extraction
- `src/middleware.ts` - Better CORS handling
- `src/lib/csrf-client.ts` - New client-side helper (created)

The CSRF protection is now properly configured for production deployment on Hostinger.