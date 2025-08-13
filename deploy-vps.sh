#!/bin/bash

# VPS Deployment Script for Real Estate Website
# Run this script on your VPS server

echo "🚀 Starting VPS Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This script will create a deployment user."
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx mysql-server ufw

# Install Node.js 18.x
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installations
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js installed: $node_version"
print_status "npm installed: $npm_version"

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2

# Create deployment user
print_status "Creating deployment user..."
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# Create application directory
print_status "Setting up application directory..."
mkdir -p /var/www/real-estate-website
chown deploy:deploy /var/www/real-estate-website

# Configure MySQL
print_status "Configuring MySQL..."
mysql_secure_installation

# Create database and user
print_status "Creating database..."
mysql -u root -p <<EOF
CREATE DATABASE real_estate_db;
CREATE USER 'real_estate_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON real_estate_db.* TO 'real_estate_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF

# Configure UFW firewall
print_status "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

print_status "Basic VPS setup completed!"
print_warning "Next steps:"
echo "1. Upload your application code to /var/www/real-estate-website"
echo "2. Run the application setup script as 'deploy' user"
echo "3. Configure Nginx"
echo "4. Start the application with PM2"
echo ""
echo "Switch to deploy user: sudo su - deploy"