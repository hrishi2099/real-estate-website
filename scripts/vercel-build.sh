#!/bin/bash

echo "🔧 Running Vercel build script..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Vercel build completed!"