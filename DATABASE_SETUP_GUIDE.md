# 🗄️ Database Setup Guide - Fix for Supabase Connection Issue

## Problem
Your Supabase database at `db.zpvpsdauusvwjovwblwp.supabase.co` is unreachable. This causes the "service temporarily unavailable" error.

## ⚡ Quick Solution: Set Up New Free Database

### Option 1: New Supabase Project (Recommended)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign in** and click **"New Project"**
3. **Organization:** Use existing or create new
4. **Project Name:** `real-estate-production`
5. **Database Password:** Create strong password (save it!)
6. **Region:** Choose closest to your users
7. **Click "Create new project"** (takes 2-3 minutes)

8. **Get Database URL:**
   - Go to **Settings → Database**
   - Copy **Connection string** (URI format)
   - Should look like: `postgresql://postgres:YOUR_PASSWORD@db.ABC123.supabase.co:5432/postgres`

### Option 2: Neon Database (Alternative)

1. **Go to [neon.tech](https://neon.tech)**
2. **Sign up** with GitHub/Google
3. **Create Project:** Name it "real-estate-prod"
4. **Copy connection string** from dashboard
5. **Format:** `postgresql://username:password@host/database?sslmode=require`

### Option 3: Railway Database (Alternative)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up** with GitHub
3. **New Project → Add PostgreSQL**
4. **Copy DATABASE_URL** from Variables tab

## 🔧 Update Vercel Environment Variables

1. **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **Edit DATABASE_URL** variable
3. **Paste your new database URL**
4. **Save** and **Redeploy**

## 🌱 Seed Your New Database

After updating DATABASE_URL:

1. **Wait for deployment** (2-3 minutes)
2. **Visit:** `https://your-vercel-app.vercel.app/api/seed?key=your-secret-seed-key-123`
3. **Should return:** `{"success": true, "message": "Database seeded successfully!"}`

## 🧪 Test Login

1. **Go to:** `https://your-vercel-app.vercel.app/login`
2. **Login with:** 
   - Email: `admin@zaminseva.com`
   - Password: `admin123`

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

```bash
✅ DATABASE_URL = postgresql://your-new-database-url
✅ JWT_SECRET = your-super-secure-jwt-secret-key-change-this-in-production
✅ NEXTAUTH_SECRET = your-nextauth-secret-key-here  
✅ NEXTAUTH_URL = https://your-vercel-app.vercel.app
✅ SEED_SECRET = your-secret-seed-key-123
```

## 🆘 Troubleshooting

### Still getting "service unavailable"?
- Check if new DATABASE_URL is correctly set in Vercel
- Make sure there are no typos in the URL
- Wait 2-3 minutes after changing environment variables

### Database connection works but no data?
- Run the seed endpoint: `/api/seed?key=your-secret-seed-key-123`
- Check `/api/debug` to see if admin user exists

### Need help?
Share the output from: `https://your-app.vercel.app/api/debug`

---

## 💡 Why This Happened

Supabase pauses inactive projects after a period of inactivity. This is normal for free tier projects. The new database will work reliably for your production app.