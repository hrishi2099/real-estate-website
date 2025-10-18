# Production Deployment Guide - Financial Management System

## Problem
The production database schema is out of sync with the local development database, causing foreign key constraint errors when trying to apply migrations.

## Solution Options

### Option 1: Manual SQL Deployment (Recommended - Safest)

1. **Backup your production database first!**
   ```bash
   # On your production server
   mysqldump -u username -p database_name > backup_before_financial_mgmt.sql
   ```

2. **Run the SQL script directly on production**
   - Use the `production-deploy.sql` file
   - Execute it via MySQL client, phpMyAdmin, or your hosting control panel
   - This only adds the new financial management tables without touching existing tables

3. **Verify the deployment**
   ```bash
   # Check that all tables were created
   mysql -u username -p database_name -e "SHOW TABLES LIKE '%invoices%';"
   mysql -u username -p database_name -e "SHOW TABLES LIKE '%payments%';"
   mysql -u username -p database_name -e "SHOW TABLES LIKE '%commission_payouts%';"
   ```

### Option 2: Prisma Baseline (For Prisma-managed deployments)

If your production environment uses Prisma migrations:

1. **Mark the current state as the baseline**
   ```bash
   # On production server with your production DATABASE_URL
   npx prisma migrate resolve --applied 20251013142159_init_with_channel_partners
   npx prisma migrate deploy
   ```

2. **Deploy the new migration**
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: Force Schema Push (Use with caution)

Only if you're certain about data safety:

```bash
# Set production DATABASE_URL in environment
npx prisma db push --accept-data-loss
```

**Warning**: This will modify the schema to match exactly, potentially dropping and recreating tables.

## Post-Deployment Steps

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Restart your application**
   ```bash
   # Restart your Next.js production server
   pm2 restart your-app  # or your deployment method
   ```

3. **Create an ACCOUNTS user**
   - Log into your production database
   - Update an existing user's role to 'ACCOUNTS':
   ```sql
   UPDATE users SET role = 'ACCOUNTS' WHERE email = 'accounts@yourcompany.com';
   ```

4. **Test the deployment**
   - Log in with the ACCOUNTS user credentials
   - Navigate to `/accounts`
   - Verify all pages load correctly:
     - `/accounts` - Dashboard
     - `/accounts/invoices` - Invoice management
     - `/accounts/payments` - Payment processing
     - `/accounts/commission-payouts` - Commission payouts

## Rollback Plan

If something goes wrong:

1. **Restore from backup**
   ```bash
   mysql -u username -p database_name < backup_before_financial_mgmt.sql
   ```

2. **Drop the new tables manually**
   ```sql
   DROP TABLE IF EXISTS `expenses`;
   DROP TABLE IF EXISTS `transactions`;
   DROP TABLE IF EXISTS `commission_payouts`;
   DROP TABLE IF EXISTS `payments`;
   DROP TABLE IF EXISTS `invoices`;

   -- Revert the role enum (if needed)
   ALTER TABLE `users` MODIFY `role` ENUM('USER', 'ADMIN', 'SALES_MANAGER', 'CHANNEL_PARTNER') NOT NULL DEFAULT 'USER';
   ```

## Troubleshooting

### Error: Foreign key constraint fails
- **Cause**: Production database structure doesn't match expected state
- **Solution**: Use Option 1 (Manual SQL) which uses `CREATE TABLE IF NOT EXISTS`

### Error: Table already exists
- **Cause**: Tables were partially created
- **Solution**: Drop the existing tables and run the script again

### Error: Enum value already exists
- **Cause**: The ACCOUNTS role was already added
- **Solution**: Safe to ignore, or remove that ALTER TABLE statement from the SQL

## Verification Checklist

- [ ] Production database backed up
- [ ] All 5 new tables created (invoices, payments, commission_payouts, transactions, expenses)
- [ ] ACCOUNTS role added to users table
- [ ] Foreign key constraints established
- [ ] Prisma Client regenerated
- [ ] Application restarted
- [ ] ACCOUNTS user created and can log in
- [ ] All accounts pages accessible
- [ ] Can create a test invoice
- [ ] Can record a test payment
- [ ] Can create a test commission payout

## Support

If you encounter any issues:
1. Check the application logs
2. Check the database error logs
3. Verify all environment variables are set correctly
4. Ensure DATABASE_URL points to the production database
