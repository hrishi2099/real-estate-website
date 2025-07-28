# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Real Estate Website to Vercel.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database Service**: Set up a MySQL database (recommended: PlanetScale, Railway, or AWS RDS)
4. **Email Service**: Configure email service (Gmail, SendGrid, or Mailgun)

## Step 1: Prepare Your Database

### Option A: PlanetScale (Recommended)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection string from the dashboard
4. Copy the `DATABASE_URL` for later use

### Option B: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new MySQL database
3. Copy the connection string from the dashboard

### Option C: AWS RDS or Other Cloud Provider
1. Set up a MySQL instance
2. Configure security groups to allow connections
3. Get your connection string

## Step 2: Deploy to Vercel

### Via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository containing your real estate website

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   Click "Environment Variables" and add the following:

   ```
   DATABASE_URL=mysql://username:password@hostname:3306/database_name
   NEXTAUTH_SECRET=your-super-secret-key-here-at-least-32-characters
   NEXTAUTH_URL=https://your-app-name.vercel.app
   JWT_SECRET=your-jwt-secret-key-here
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Real Estate Platform
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   # ... add all other environment variables
   ```

## Step 3: Set Up Database Schema

After successful deployment, you need to set up your database schema:

### Option A: Using Vercel Dashboard
1. Go to your project's Functions tab
2. Find any API route and click "View Function Logs"
3. Trigger the API route to initialize the database connection

### Option B: Using Local Development
1. **Set up local environment with production database**:
   ```bash
   # Create .env.local with production DATABASE_URL
   echo "DATABASE_URL=your-production-database-url" > .env.local
   ```

2. **Push database schema**:
   ```bash
   npm run db:push
   ```

3. **Optional: Seed database**:
   ```bash
   npm run db:seed
   ```

## Step 4: Configure Domain (Optional)

1. **Custom Domain**:
   - Go to your project settings in Vercel
   - Click "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**:
   - Update `NEXTAUTH_URL` to your custom domain
   - Update `NEXT_PUBLIC_BASE_URL` to your custom domain

## Step 5: Verify Deployment

1. **Check Website**:
   - Visit your Vercel URL
   - Test main pages (home, properties, contact)
   - Verify responsive design

2. **Test Authentication**:
   - Try user registration
   - Test login/logout functionality
   - Verify password reset emails

3. **Test Database**:
   - Create a test property (admin required)
   - Submit a contact form
   - Check database connections

4. **Check API Routes**:
   - Test `/api/health` endpoint
   - Verify `/api/properties` returns data
   - Test authentication endpoints

## Step 6: Monitor and Optimize

### Performance Monitoring
1. **Vercel Analytics**:
   - Enable in your Vercel dashboard
   - Monitor page load times and user interactions

2. **Error Monitoring**:
   - Check function logs in Vercel dashboard
   - Set up error tracking (optional: Sentry integration)

### Database Optimization
1. **Connection Pooling**:
   - Ensure your database service supports connection pooling
   - Monitor connection usage

2. **Query Optimization**:
   - Monitor slow queries
   - Add database indexes as needed

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation locally

2. **Database Connection Errors**:
   - Verify `DATABASE_URL` format
   - Check database service status
   - Ensure database allows external connections

3. **Environment Variable Issues**:
   - Double-check all required environment variables
   - Ensure no extra spaces or quotes
   - Redeploy after adding new environment variables

4. **API Route Timeouts**:
   - Check function execution time in logs
   - Optimize database queries
   - Consider upgrading Vercel plan for longer timeouts

5. **Email Not Working**:
   - Verify email service credentials
   - Check SMTP settings
   - Test email configuration locally first

### Debug Commands

```bash
# Check build locally
npm run build

# Test database connection
npm run db:generate
npm run db:push

# Run production build locally
npm run build && npm start

# Check for TypeScript errors
npx tsc --noEmit
```

## Environment Variables Reference

### Required Variables
- `DATABASE_URL`: MySQL connection string
- `NEXTAUTH_SECRET`: NextAuth encryption secret (32+ characters)
- `NEXTAUTH_URL`: Your app's URL
- `JWT_SECRET`: JWT token secret

### Email Configuration
- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP port (587 for TLS, 465 for SSL)
- `EMAIL_SECURE`: true for SSL, false for TLS
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `EMAIL_FROM`: Sender email address
- `EMAIL_FROM_NAME`: Sender display name

### Optional Variables
- `NODE_ENV`: Set to "production"
- `NEXT_PUBLIC_BASE_URL`: Public URL for client-side redirects

## Security Considerations

1. **Secrets Management**:
   - Use strong, unique secrets for production
   - Never commit secrets to version control
   - Rotate secrets regularly

2. **Database Security**:
   - Use database connection limits
   - Enable SSL connections
   - Regularly backup your database

3. **CORS Configuration**:
   - Restrict API access to your domain
   - Review CORS headers in production

## Performance Tips

1. **Image Optimization**:
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

2. **Caching**:
   - Implement API response caching
   - Use Vercel's Edge Cache

3. **Database**:
   - Use connection pooling
   - Implement query result caching
   - Add database indexes

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)

Your real estate website is now deployed and ready for production use!