# Deploy from GitHub to Hostinger

This guide shows you how to deploy your real estate website from GitHub to Hostinger using different methods.

## Prerequisites

- ✅ GitHub repository: https://github.com/hrishi2099/real-estate-website
- ✅ Hostinger VPS with SSH access
- ✅ Domain pointed to your server
- ✅ MySQL database created in Hostinger

## Method 1: SSH + Git Clone (Recommended)

### Step 1: SSH into Your Hostinger Server
```bash
# SSH into your server (replace with your server IP)
ssh root@your-server-ip

# Or if you have a non-root user
ssh your-username@your-server-ip
```

### Step 2: Navigate to Web Directory
```bash
# For Cloud Panel (typical path)
cd /home/cloudpanel/htdocs/yourdomain.com

# For cPanel/hPanel (typical path)
cd /home/your-username/public_html

# Or check your hosting documentation for the correct path
```

### Step 3: Clone Your Repository
```bash
# Clone your repository
git clone https://github.com/hrishi2099/real-estate-website.git .

# If directory is not empty, clone to temp folder then move
git clone https://github.com/hrishi2099/real-estate-website.git temp
mv temp/* .
mv temp/.* . 2>/dev/null || true
rmdir temp
```

### Step 4: Install Dependencies
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Install PM2 globally for process management
npm install -g pm2
```

### Step 5: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit environment file with your details
nano .env
```

Add your Hostinger-specific configuration:
```env
# MySQL Database Configuration (Hostinger Format)
DATABASE_URL="mysql://u123456789_dbuser:your_password@localhost:3306/u123456789_realestate"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-for-production"

# Next.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-for-production"
NEXTAUTH_URL="https://yourdomain.com"

# Base URL
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Email Configuration (Hostinger SMTP)
EMAIL_HOST="smtp.hostinger.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Real Estate Company"

# Production Environment
NODE_ENV="production"
```

### Step 6: Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### Step 7: Build and Deploy
```bash
# Build the application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'real-estate-website',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
EOF

# Create server.js file
cat > server.js << 'EOF'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Method 2: Hostinger File Manager + GitHub ZIP

### Step 1: Download Repository as ZIP
1. Go to: https://github.com/hrishi2099/real-estate-website
2. Click **Code** → **Download ZIP**
3. Save `real-estate-website-main.zip` to your computer

### Step 2: Upload via Hostinger File Manager
1. Log into **Hostinger Control Panel**
2. Go to **File Manager**
3. Navigate to your domain's public folder:
   - `public_html` (for shared hosting)
   - `/home/cloudpanel/htdocs/yourdomain.com` (for VPS)
4. Click **Upload** → **Choose Files**
5. Upload the ZIP file
6. Right-click the ZIP → **Extract**
7. Move contents from `real-estate-website-main/` to root directory

### Step 3: Setup via SSH or Terminal
Follow Steps 4-7 from Method 1 above

## Method 3: Automated Deployment with GitHub Actions

### Step 1: Create Deploy Script on Server
```bash
# Create deployment script
cat > /home/deploy.sh << 'EOF'
#!/bin/bash
cd /home/cloudpanel/htdocs/yourdomain.com

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Update database schema
npx prisma db push

# Restart application
pm2 restart real-estate-website

echo "✅ Deployment completed!"
EOF

chmod +x /home/deploy.sh
```

### Step 2: Setup GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        script: /home/deploy.sh
```

## Method 4: Hostinger Git Integration (if available)

### Check for Git Integration
1. Log into Hostinger Control Panel
2. Look for **Git Version Control** or **Git Integration**
3. If available:
   - Click **Create Repository**
   - Enter: `https://github.com/hrishi2099/real-estate-website.git`
   - Select branch: `main`
   - Set deployment path
   - Click **Deploy**

## Post-Deployment Setup

### Configure Web Server
1. **For Cloud Panel:**
   - Go to **Sites** → Your site → **Vhost**
   - Add proxy configuration for port 3000

2. **For cPanel/hPanel:**
   - Use Node.js app manager if available
   - Set startup file to `server.js`
   - Set Node.js version to 18.x

### Setup SSL
1. In Hostinger panel → **SSL/TLS**
2. Enable **Let's Encrypt** certificate
3. Force HTTPS redirect

### Configure Domain
1. Ensure domain DNS points to your server IP
2. Wait for DNS propagation (up to 24 hours)
3. Test: `https://yourdomain.com`

## Updating Your Site

### Method 1: Git Pull (Recommended)
```bash
# SSH into server
ssh your-username@your-server-ip

# Navigate to site directory
cd /home/cloudpanel/htdocs/yourdomain.com

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart real-estate-website
```

### Method 2: Automated with Deploy Script
```bash
# Just run the deploy script
/home/deploy.sh
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**
   ```bash
   sudo chown -R your-username:your-username /path/to/site
   chmod -R 755 /path/to/site
   ```

2. **Node.js Not Found**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Database Connection Error**
   - Check database credentials in `.env`
   - Verify database exists in Hostinger panel
   - Test connection: `mysql -u username -p database_name`

4. **Port 3000 Already in Use**
   ```bash
   # Check what's using port 3000
   sudo netstat -tulpn | grep 3000
   
   # Kill process if needed
   sudo kill -9 PID_NUMBER
   ```

5. **Build Fails**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Check Deployment Status
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs real-estate-website

# Monitor in real-time
pm2 monit
```

## Security Checklist

- ✅ Change default JWT secrets
- ✅ Use strong database passwords
- ✅ Enable HTTPS/SSL
- ✅ Set up firewall rules
- ✅ Regular security updates
- ✅ Backup database regularly

## Support

- **Repository:** https://github.com/hrishi2099/real-estate-website
- **Hostinger Docs:** https://support.hostinger.com
- **Node.js on Hostinger:** Check hosting provider documentation

Your real estate website should now be live! 🎉

Test it at: `https://yourdomain.com`