# Hostinger Deployment Guide - Ubuntu with Cloud Panel

This guide covers deploying your Next.js real estate website on Hostinger using Ubuntu VPS with Cloud Panel.

## Prerequisites

- Hostinger VPS with Ubuntu
- Domain name
- Cloud Panel installed
- Your Next.js application ready for deployment

## Step 1: Initial Server Setup

### 1.1 Access Your Hostinger VPS
```bash
# SSH into your server
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common
```

### 1.2 Install Node.js and npm
```bash
# Install Node.js 18.x (recommended for Next.js)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Cloud Panel Setup

### 2.1 Install Cloud Panel (if not already installed)
```bash
# Download and install Cloud Panel
curl -sSL https://installer.cloudpanel.io/ce/v2/install.sh | sudo bash

# Access Cloud Panel at: https://your-server-ip:8443
# Default login: admin / use the password shown during installation
```

### 2.2 Create Website in Cloud Panel
1. Login to Cloud Panel: `https://your-server-ip:8443`
2. Go to **Sites** → **Add Site**
3. Choose **Node.js** as the application type
4. Enter your domain name
5. Set Node.js version to 18.x
6. Create the site

## Step 3: Database Setup

### 3.1 Create MySQL Database in Hostinger
1. Log into your **Hostinger Control Panel** (hPanel)
2. Go to **Databases** → **MySQL Databases**
3. Click **Create Database**
4. Enter database name suffix (e.g., `realestate`) - Hostinger will prefix it automatically
5. Create database user suffix (e.g., `dbuser`) - Hostinger will prefix it automatically
6. Set a strong password
7. Grant all privileges to the user

### 3.2 Note Database Credentials (Hostinger Format)
```env
Database Host: localhost
Database Name: u123456789_realestate (your cPanel username + database suffix)
Database User: u123456789_dbuser (your cPanel username + user suffix)
Database Password: [your-chosen-password]
Database Port: 3306
```

**Important:** Hostinger automatically adds your cPanel username as a prefix (e.g., `u123456789_`)

## Step 4: Deploy Your Application

### 4.1 Upload Code via Git
```bash
# Navigate to your site directory (replace 'yourdomain.com' with your actual domain)
cd /home/cloudpanel/htdocs/yourdomain.com

# Clone your repository
git clone https://github.com/yourusername/real-estate-website.git .

# Or upload files via SFTP/Cloud Panel File Manager
```

### 4.2 Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install PM2 for process management
npm install -g pm2
```

### 4.3 Configure Environment Variables
```bash
# Create production environment file
nano .env.production

# Add the following content:
```

```env
# MySQL Database Configuration (Hostinger Format)
DATABASE_URL="mysql://u123456789_dbuser:your_password@localhost:3306/u123456789_realestate"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-for-production-change-this"

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

### 4.4 Setup Database Schema
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### 4.5 Build Application
```bash
# Build the Next.js application
npm run build

# Test the build locally
npm start
```

## Step 5: Configure Cloud Panel for Next.js

### 5.1 Update Site Settings in Cloud Panel
1. Go to **Sites** → Select your site → **Settings**
2. Set **Document Root** to: `/home/cloudpanel/htdocs/yourdomain.com`
3. Set **Node.js Version** to: `18.x`
4. Set **App Startup File** to: `server.js` (we'll create this)

### 5.2 Create Server File
```bash
# Create a server.js file for production
nano server.js
```

Add this content to `server.js`:
```javascript
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
```

### 5.3 Setup PM2 Process Manager
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
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
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Step 6: Configure Nginx Proxy

### 6.1 Update Nginx Configuration in Cloud Panel
1. Go to **Sites** → Select your site → **Vhost**
2. Add this location block inside the server block:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 6.2 Setup SSL Certificate
1. In Cloud Panel, go to **Sites** → Select your site → **SSL/TLS**
2. Choose **Let's Encrypt** for free SSL
3. Enable **Force HTTPS**

## Step 7: File Upload Configuration

### 7.1 Create Upload Directory
```bash
# Create uploads directory with proper permissions
mkdir -p /home/cloudpanel/htdocs/yourdomain.com/public/uploads
chmod 755 /home/cloudpanel/htdocs/yourdomain.com/public/uploads
chown cloudpanel:cloudpanel /home/cloudpanel/htdocs/yourdomain.com/public/uploads
```

### 7.2 Configure Nginx for File Uploads
Add to your Nginx vhost configuration:
```nginx
client_max_body_size 50M;

location /uploads/ {
    alias /home/cloudpanel/htdocs/yourdomain.com/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Step 8: Email Configuration

### 8.1 Setup Email Account in Hostinger
1. Go to Hostinger Control Panel → **Email**
2. Create email account: `noreply@yourdomain.com`
3. Note the password for environment variables

### 8.2 Test Email Configuration
```bash
# Test email endpoint
curl -X POST https://yourdomain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

## Step 9: Monitoring and Maintenance

### 9.1 Monitor Application
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs real-estate-website

# Monitor resources
pm2 monit
```

### 9.2 Setup Log Rotation
```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Step 10: Deployment Script

Create an automated deployment script:

```bash
# Create deploy script
nano deploy.sh
chmod +x deploy.sh
```

```bash
#!/bin/bash

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
```

## Troubleshooting

### Common Issues:

1. **Permission Errors**
   ```bash
   sudo chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/yourdomain.com
   sudo chmod -R 755 /home/cloudpanel/htdocs/yourdomain.com
   ```

2. **Database Connection Issues**
   - Verify MySQL service: `sudo systemctl status mysql`
   - Check database credentials in `.env.production`
   - Test connection: `mysql -u realestate_user -p realestate_db`

3. **Port Issues**
   - Check if port 3000 is available: `netstat -tulpn | grep 3000`
   - Use alternative port in ecosystem.config.js

4. **SSL Issues**
   - Verify domain DNS points to server IP
   - Check Cloud Panel SSL settings
   - Restart Nginx: `sudo systemctl restart nginx`

## Security Checklist

- ✅ Strong database passwords
- ✅ JWT secrets changed from defaults
- ✅ HTTPS enabled with SSL certificate
- ✅ File upload restrictions in place
- ✅ Environment variables secured
- ✅ Regular backups configured
- ✅ Firewall configured (UFW)
- ✅ Regular security updates

## Backup Strategy

```bash
# Database backup
mysqldump -u realestate_user -p realestate_db > backup_$(date +%Y%m%d_%H%M%S).sql

# File backup
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz /home/cloudpanel/htdocs/yourdomain.com
```

## Support Resources

- **Hostinger Documentation**: https://support.hostinger.com
- **Cloud Panel Documentation**: https://www.cloudpanel.io/docs/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

Your real estate website should now be successfully deployed on Hostinger with Ubuntu and Cloud Panel!