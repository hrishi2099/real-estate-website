# 🔧 Vercel Database Fix Guide

## Problem
Database data not showing on Vercel deployment while working locally.

## Root Cause
- Vercel doesn't have access to your environment variables
- Production database is not seeded with sample data
- Missing database migrations on production

## ✅ Solution Steps

### Step 1: Configure Vercel Environment Variables

1. **Go to your Vercel project dashboard**
2. **Navigate to: Settings → Environment Variables**
3. **Add these variables:**

```bash
# Database Configuration
DATABASE_URL = postgresql://postgres:$xAxV!Q$T@ZBz!4@db.zpvpsdauusvwjovwblwp.supabase.co:5432/postgres

# Authentication
JWT_SECRET = your-super-secure-jwt-secret-key-change-this-in-production
NEXTAUTH_SECRET = your-nextauth-secret-key-here
NEXTAUTH_URL = https://your-vercel-app.vercel.app

# Email (Optional - for contact forms)
EMAIL_FROM = noreply@yourdomain.com
EMAIL_HOST = smtp.hostinger.com
EMAIL_PORT = 587
EMAIL_USER = your-email@yourdomain.com  
EMAIL_PASS = your-email-password

# Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your-google-maps-api-key-here

# Seed Security (for production seeding)
SEED_SECRET = your-secret-seed-key-123
```

### Step 2: Redeploy Your Application

After adding environment variables:

1. **Go to Deployments tab in Vercel**
2. **Click "Redeploy" on the latest deployment**
3. **Or push a new commit to trigger auto-deployment**

### Step 3: Seed the Production Database

Once deployed, seed your database using one of these methods:

#### Method A: API Endpoint (Recommended)
Visit: `https://your-vercel-app.vercel.app/api/seed?key=your-secret-seed-key-123`

#### Method B: Local Script (Alternative)
```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"
npm run db:seed-production
```

### Step 4: Verify Database Setup

1. **Visit your Vercel app**
2. **Try logging in with admin credentials:**
   - Email: `admin@zaminseva.com`
   - Password: `admin123`
3. **Check if properties and data are showing**

## 🔍 Troubleshooting

### Issue: "Environment variables not found"
- **Solution:** Double-check all environment variables are set in Vercel dashboard
- **Wait:** Give Vercel 1-2 minutes after adding variables before redeploying

### Issue: "Database connection failed" 
- **Solution:** Verify your Supabase database URL is correct and accessible
- **Check:** Supabase project is running and not paused

### Issue: "Admin login not working"
- **Solution:** Run the seed API endpoint first to create admin user
- **Verify:** Database is properly seeded with user data

### Issue: "Properties not showing"
- **Solution:** Seed the database using the API endpoint
- **Check:** API routes are working by visiting `/api/properties`

## 🎯 Quick Verification Commands

```bash
# Test API endpoints locally first
curl http://localhost:3000/api/health
curl http://localhost:3000/api/properties

# Test production endpoints
curl https://your-vercel-app.vercel.app/api/health  
curl https://your-vercel-app.vercel.app/api/properties
```

## 📝 Expected Results After Fix

✅ **Admin login works:** admin@zaminseva.com / admin123  
✅ **Properties show on homepage**  
✅ **Admin dashboard has data**  
✅ **Database operations work**  
✅ **API endpoints return data**  

## 🚀 Prevention for Future Deployments

1. **Always set environment variables before deployment**
2. **Run database seeds after successful deployment**  
3. **Test API endpoints before testing frontend**
4. **Use Vercel's function logs to debug issues**

---

**Need help?** Check Vercel function logs in the dashboard for detailed error messages.