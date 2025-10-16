-- Update users table Role enum to include CHANNEL_PARTNER
-- Run this BEFORE creating channel_partners table if Role enum doesn't have CHANNEL_PARTNER

-- Check current Role enum values
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'role';

-- Update the enum to include CHANNEL_PARTNER
-- This will preserve existing values and add the new one
ALTER TABLE `users`
MODIFY COLUMN `role` ENUM('USER', 'ADMIN', 'SALES_MANAGER', 'CHANNEL_PARTNER') NOT NULL DEFAULT 'USER';

-- Verify the update
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'role';

SELECT 'Users Role enum updated successfully!' AS status;
