# Migration Fix Guide for Production Server

## Problem
Migration `20251003155201_add_kml_content_and_memorable_moments` failed on production because the `memorable_moments` table already existed.

## Solution Steps

### Step 1: Mark the Failed Migration as Rolled Back
On your **production server**, run:
```bash
npx prisma migrate resolve --rolled-back 20251003155201_add_kml_content_and_memorable_moments
```

This tells Prisma that the migration failed and should be retried.

### Step 2: Apply Migrations
On your **production server**, run:
```bash
npx prisma migrate deploy
```

This will re-apply the migration with the fixed SQL that handles existing tables gracefully.

### Step 3: Verify the Migration
Check that the migration succeeded:
```bash
npx prisma migrate status
```

You should see:
```
Database schema is up to date!
```

## What Was Fixed

The migration SQL has been updated to:
1. Check if the `kmlContent` column exists before adding it
2. Use `CREATE TABLE IF NOT EXISTS` for both `memorable_moments` and `memorable_moments_section` tables
3. Match the actual schema structure (using `date` instead of `year`, `displayOrder` instead of `order`, etc.)

## Alternative: If Tables Need Schema Updates

If the existing tables don't match the current schema structure, you may need to:

1. Manually drop the tables (⚠️ **WARNING: This deletes data!**):
```sql
DROP TABLE IF EXISTS `memorable_moments`;
DROP TABLE IF EXISTS `memorable_moments_section`;
```

2. Then mark as rolled back and reapply:
```bash
npx prisma migrate resolve --rolled-back 20251003155201_add_kml_content_and_memorable_moments
npx prisma migrate deploy
```

## Quick Reference Commands

### Mark migration as rolled back:
```bash
npx prisma migrate resolve --rolled-back 20251003155201_add_kml_content_and_memorable_moments
```

### Apply migrations:
```bash
npx prisma migrate deploy
```

### Check status:
```bash
npx prisma migrate status
```

### Generate Prisma Client (after successful migration):
```bash
npx prisma generate
```
