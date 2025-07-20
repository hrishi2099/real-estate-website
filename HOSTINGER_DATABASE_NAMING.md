# Hostinger Database Naming Guide

## Problem: "Database user name and database name is value not valid on hostinger"

Hostinger has specific naming conventions for MySQL databases and usernames that automatically include your cPanel username as a prefix.

## How to Find Your cPanel Username

### Method 1: Check Hostinger Control Panel
1. Log into your **Hostinger Control Panel** (hPanel)
2. Look at the top of the dashboard - your username is displayed
3. It usually looks like: `u123456789` (starts with 'u' followed by numbers)

### Method 2: Check in Database Section
1. Go to **Databases** → **MySQL Databases**
2. Any existing databases will show the full format with prefix
3. Example: If you see `u123456789_wordpress`, then `u123456789` is your prefix

### Method 3: Check File Manager
1. Go to **File Manager**
2. The path shows: `/home/u123456789/public_html`
3. The `u123456789` part is your cPanel username

## Correct Database Naming Format

### When Creating Database:
- **You enter:** `realestate` (just the suffix)
- **Hostinger creates:** `u123456789_realestate` (with your prefix)

### When Creating User:
- **You enter:** `dbuser` (just the suffix)  
- **Hostinger creates:** `u123456789_dbuser` (with your prefix)

## Correct DATABASE_URL Format

```env
DATABASE_URL="mysql://u123456789_dbuser:your_password@localhost:3306/u123456789_realestate"
```

**Replace:**
- `u123456789` = Your actual cPanel username
- `dbuser` = Your chosen user suffix
- `realestate` = Your chosen database suffix
- `your_password` = Your chosen password

## Real Example

If your cPanel username is `u987654321`:

**Database Creation:**
- Enter: `realestate`
- Hostinger creates: `u987654321_realestate`

**User Creation:**
- Enter: `dbuser`
- Hostinger creates: `u987654321_dbuser`

**Final DATABASE_URL:**
```env
DATABASE_URL="mysql://u987654321_dbuser:MySecurePass123@localhost:3306/u987654321_realestate"
```

## Common Mistakes

❌ **Wrong:** `DATABASE_URL="mysql://realestate_user:pass@localhost:3306/realestate_db"`
✅ **Correct:** `DATABASE_URL="mysql://u123456789_dbuser:pass@localhost:3306/u123456789_realestate"`

❌ **Wrong:** Using generic names without prefix
✅ **Correct:** Always include your cPanel username prefix

## Troubleshooting

### Error: "Access denied for user"
- Check that you're using the full username with prefix
- Verify the password is correct
- Ensure the user has privileges on the database

### Error: "Database does not exist" 
- Check that you're using the full database name with prefix
- Verify the database was created successfully in Hostinger panel

### Error: "Connection refused"
- Host should be `localhost` (not an IP address)
- Port should be `3306`
- Check if MySQL service is running

## Quick Setup Checklist

1. ✅ Find your cPanel username (e.g., `u123456789`)
2. ✅ Create database with suffix (e.g., `realestate`)
3. ✅ Create user with suffix (e.g., `dbuser`)
4. ✅ Set strong password
5. ✅ Update DATABASE_URL with full names including prefix
6. ✅ Test connection

Your DATABASE_URL should look like:
```env
DATABASE_URL="mysql://[prefix]_[user]:[password]@localhost:3306/[prefix]_[database]"
```