#!/bin/bash

echo "🚀 Starting Hostinger Deployment Process..."

# Build the application
echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create deployment package
echo "📁 Creating deployment package..."
tar -czf hostinger-deploy.tar.gz \
    .next \
    public \
    prisma \
    package.json \
    package-lock.json \
    next.config.js \
    .env.production \
    --exclude-vcs

echo "✅ Deployment package created: hostinger-deploy.tar.gz"
echo ""
echo "📋 Next steps for Hostinger deployment:"
echo "1. Upload hostinger-deploy.tar.gz to your Hostinger file manager"
echo "2. Extract it in your public_html directory"
echo "3. Set up your MySQL database in Hostinger control panel"
echo "4. Update .env.production with your database credentials"
echo "5. Run: npm install --production"
echo "6. Run: npx prisma db push"
echo "7. Run: npm run start"
echo ""
echo "🔗 Your site will be available at your domain!"