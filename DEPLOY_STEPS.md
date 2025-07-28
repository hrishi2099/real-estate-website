# Vercel CLI Deployment Steps

## Step 1: Complete Login (You're here now)
The CLI is asking you to login. Choose your preferred method (GitHub recommended):
- Use arrow keys to select "Continue with GitHub"
- Press Enter
- Follow the browser authentication flow
- Return to terminal when complete

## Step 2: Run Initial Deployment
After login, run:
```bash
vercel --prod
```

**Configuration prompts you'll see:**
- Set up and deploy "~/newProject/real-estate-website"? **[Y/n]** → Press Y
- Which scope do you want to deploy to? → Select your account
- Found project "real-estate-website". Link to it? **[Y/n]** → Press Y (or N if you want a new project)
- Want to override the settings? **[y/N]** → Press N (use our vercel.json config)

## Step 3: Set Environment Variables
After deployment, configure these required variables:

```bash
# Database (you'll need to set up a MySQL database first)
vercel env add DATABASE_URL production

# Authentication secrets
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add JWT_SECRET production

# Base URL
vercel env add NEXT_PUBLIC_BASE_URL production

# Email configuration
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_SECURE production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add EMAIL_FROM production
vercel env add EMAIL_FROM_NAME production

# Environment
vercel env add NODE_ENV production
```

**Example values:**
- DATABASE_URL: `mysql://username:password@hostname:3306/database_name`
- NEXTAUTH_SECRET: `your-32-character-secret-key-here`
- NEXTAUTH_URL: `https://your-app-name.vercel.app`
- JWT_SECRET: `your-jwt-secret-key`
- NEXT_PUBLIC_BASE_URL: `https://your-app-name.vercel.app`
- EMAIL_HOST: `smtp.gmail.com`
- EMAIL_PORT: `587`
- EMAIL_SECURE: `false`
- NODE_ENV: `production`

## Step 4: Database Setup
You'll need a MySQL database. Quick options:

### Option A: PlanetScale (Recommended - Free tier)
1. Go to https://planetscale.com
2. Sign up and create a database
3. Get connection string from dashboard
4. Use it as DATABASE_URL

### Option B: Railway (Alternative)
1. Go to https://railway.app
2. Create MySQL database
3. Copy connection string

## Step 5: Redeploy with Environment Variables
After setting environment variables:
```bash
vercel --prod
```

## Step 6: Initialize Database Schema
Once deployed with database URL:
```bash
# Set local env to production database
echo "DATABASE_URL=your-production-db-url" > .env.local

# Push schema to production database
npm run db:push

# Optional: Add sample data
npm run db:seed
```

## Step 7: Test Deployment
Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Properties page works
- ✅ Contact form submits
- ✅ Admin login works
- ✅ API endpoints respond

Your deployment URL will be shown after the first `vercel --prod` command.