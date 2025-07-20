# MySQL Database Setup

This project has been configured to use MySQL database instead of SQLite. Follow these steps to set up your MySQL database.

## For Local Development

### 1. Install MySQL Server
- **Windows**: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- **macOS**: `brew install mysql` or download from MySQL website
- **Ubuntu/Debian**: `sudo apt install mysql-server`
- **CentOS/RHEL**: `sudo yum install mysql-server`

### 2. Start MySQL Service
```bash
# macOS (Homebrew)
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
# Use MySQL Workbench or Services panel
```

### 3. Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE real_estate_db;

-- Create user and grant privileges
CREATE USER 'realestate_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON real_estate_db.* TO 'realestate_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 4. Update Environment Variables
Update your `.env` file with your MySQL credentials:
```env
DATABASE_URL="mysql://realestate_user:your_secure_password@localhost:3306/real_estate_db"
```

### 5. Run Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

## For Hostinger Deployment

### 1. Create MySQL Database in Hostinger Panel
1. Log in to your Hostinger control panel
2. Go to **Databases** > **MySQL Databases**
3. Click **Create Database**
4. Choose a database name (e.g., `u123456789_realestate`)
5. Create a database user with a secure password
6. Note down the database details

### 2. Get Database Connection Details
From your Hostinger panel, you'll get:
- **Database Host**: Usually `localhost` or specific hostname  
- **Database Name**: Your created database name (with cPanel prefix, e.g., `u123456789_realestate`)
- **Username**: Your database username (with cPanel prefix, e.g., `u123456789_dbuser`)
- **Password**: Your database password
- **Port**: Usually `3306`

**Important:** Hostinger automatically prefixes all database names and usernames with your cPanel username (usually starts with `u` followed by numbers).

### 3. Update Production Environment Variables
Create a `.env.production` file or update your deployment environment with:
```env
DATABASE_URL="mysql://your_username:your_password@localhost:3306/your_database_name"
```

**Example for Hostinger (with correct naming format):**
```env
DATABASE_URL="mysql://u123456789_dbuser:SecurePassword123@localhost:3306/u123456789_realestate"
```

**Where:**
- `u123456789` = Your cPanel username (find this in Hostinger panel)
- `dbuser` = Your chosen username suffix  
- `realestate` = Your chosen database name suffix

### 4. Deploy Database Schema
After deployment, run the migration:
```bash
npx prisma db push
```

## Database Schema

The MySQL database includes all the tables from the original SQLite schema:
- **users** - User accounts and authentication
- **properties** - Property listings
- **property_images** - Property photos
- **inquiries** - Property inquiries
- **favorites** - User favorite properties
- **contact_inquiries** - General contact form submissions
- **property_analytics** - Property view analytics
- **office_settings** - Company/office information

## Troubleshooting

### Connection Issues
1. Verify MySQL server is running
2. Check firewall settings (port 3306)
3. Verify database credentials
4. Test connection: `mysql -u username -p -h hostname database_name`

### Performance Optimization
1. Enable MySQL query cache
2. Add proper indexes for frequently queried fields
3. Use connection pooling in production
4. Monitor slow queries

### Backup
Regular backups are essential:
```bash
# Create backup
mysqldump -u username -p database_name > backup.sql

# Restore backup
mysql -u username -p database_name < backup.sql
```

## Migration from SQLite

If you're migrating from the previous SQLite setup:
1. Export data from SQLite: `npx prisma db seed` (if you have seed data)
2. Set up MySQL as described above
3. Run `npx prisma db push` to create MySQL schema
4. Manually migrate any existing data if needed