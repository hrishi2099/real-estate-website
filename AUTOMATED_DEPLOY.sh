#!/bin/bash

# Automated Vercel Deployment Script
# Run this after completing the vercel login manually

set -e

echo "🚀 Starting Vercel Deployment Process..."

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

echo "✅ Verified Vercel login"

# Deploy to production
echo "📦 Deploying to production..."
vercel --prod --confirm

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls --limit 1 | grep -o 'https://[^ ]*' | head -1)
echo "🌐 Deployment URL: $DEPLOYMENT_URL"

# Prompt for environment variables
echo ""
echo "🔧 Now you need to set environment variables:"
echo "   Run these commands with your actual values:"
echo ""
echo "   vercel env add DATABASE_URL production"
echo "   vercel env add NEXTAUTH_SECRET production"
echo "   vercel env add JWT_SECRET production"
echo "   vercel env add NEXTAUTH_URL production"
echo "   vercel env add NEXT_PUBLIC_BASE_URL production"
echo ""
echo "💡 Example values:"
echo "   DATABASE_URL: mysql://user:pass@host:3306/db"
echo "   NEXTAUTH_SECRET: $(openssl rand -base64 32)"
echo "   JWT_SECRET: $(openssl rand -base64 32)"
echo "   NEXTAUTH_URL: $DEPLOYMENT_URL"
echo "   NEXT_PUBLIC_BASE_URL: $DEPLOYMENT_URL"
echo ""
echo "After setting environment variables, run:"
echo "   vercel --prod"
echo ""
echo "✨ Deployment initiated! Check your Vercel dashboard for progress."