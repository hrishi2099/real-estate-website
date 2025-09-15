-- Direct SQL to fix invalid property types
-- Run this directly in your MySQL database

-- Check current invalid types
SELECT DISTINCT type FROM property WHERE type NOT IN ('AGRICULTURAL_LAND', 'NA_LAND');

-- Update LAND to AGRICULTURAL_LAND
UPDATE property SET type = 'AGRICULTURAL_LAND' WHERE type = 'LAND';

-- Update COMMERCIAL to NA_LAND
UPDATE property SET type = 'NA_LAND' WHERE type = 'COMMERCIAL';

-- Update residential types to NA_LAND
UPDATE property SET type = 'NA_LAND' WHERE type IN ('HOUSE', 'VILLA', 'APARTMENT', 'CONDO', 'TOWNHOUSE');

-- Verify all types are now valid
SELECT DISTINCT type FROM property;

-- Count of each type
SELECT type, COUNT(*) as count FROM property GROUP BY type;