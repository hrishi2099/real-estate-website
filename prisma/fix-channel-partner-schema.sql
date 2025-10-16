-- Fix for missing companyRegistration column in channel_partners table
-- This script adds the companyRegistration column
-- Run this on the production database to fix the schema mismatch

-- Add the missing column
-- If the column already exists, you'll get an error which you can safely ignore
ALTER TABLE channel_partners
ADD COLUMN companyRegistration VARCHAR(191) NULL
AFTER companyName;

-- Verify the column exists
DESCRIBE channel_partners;
