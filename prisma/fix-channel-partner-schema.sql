-- Comprehensive fix for missing columns in channel_partners table
-- This script adds all missing columns based on the Prisma schema
-- Run this on the production database to fix the schema mismatch

-- Show current table structure before changes
SELECT 'Current table structure:' AS info;
DESCRIBE channel_partners;

-- Add missing columns (in the correct order based on schema)
-- Using IF NOT EXISTS logic via stored procedure

DELIMITER $$

CREATE PROCEDURE AddColumnIfNotExists()
BEGIN
    -- Add companyRegistration if missing
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'channel_partners'
        AND COLUMN_NAME = 'companyRegistration'
    ) THEN
        ALTER TABLE channel_partners
        ADD COLUMN companyRegistration VARCHAR(191) NULL AFTER companyName;
        SELECT 'Added companyRegistration column' AS status;
    ELSE
        SELECT 'companyRegistration column already exists' AS status;
    END IF;

    -- Add website if missing
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'channel_partners'
        AND COLUMN_NAME = 'website'
    ) THEN
        ALTER TABLE channel_partners
        ADD COLUMN website VARCHAR(191) NULL AFTER companyRegistration;
        SELECT 'Added website column' AS status;
    ELSE
        SELECT 'website column already exists' AS status;
    END IF;

    -- Add city if missing
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'channel_partners'
        AND COLUMN_NAME = 'city'
    ) THEN
        ALTER TABLE channel_partners
        ADD COLUMN city VARCHAR(191) NULL AFTER website;
        SELECT 'Added city column' AS status;
    ELSE
        SELECT 'city column already exists' AS status;
    END IF;

    -- Add state if missing
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'channel_partners'
        AND COLUMN_NAME = 'state'
    ) THEN
        ALTER TABLE channel_partners
        ADD COLUMN state VARCHAR(191) NULL AFTER city;
        SELECT 'Added state column' AS status;
    ELSE
        SELECT 'state column already exists' AS status;
    END IF;

    -- Add country if missing
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'channel_partners'
        AND COLUMN_NAME = 'country'
    ) THEN
        ALTER TABLE channel_partners
        ADD COLUMN country VARCHAR(191) NULL DEFAULT 'India' AFTER state;
        SELECT 'Added country column' AS status;
    ELSE
        SELECT 'country column already exists' AS status;
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddColumnIfNotExists();

-- Clean up
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

-- Show final table structure
SELECT 'Updated table structure:' AS info;
DESCRIBE channel_partners;

-- Verify all critical columns exist
SELECT
    'Verification Results:' AS info,
    COUNT(*) AS total_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'channel_partners'
AND COLUMN_NAME IN ('companyName', 'companyRegistration', 'website', 'city', 'state', 'country');
