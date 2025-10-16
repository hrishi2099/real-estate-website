-- Create Channel Partner tables for production database
-- This script creates the channel_partners and partner_referrals tables
-- Run this on the production database

-- Check if CHANNEL_PARTNER role exists in users table enum
-- First, let's create the tables

-- Create channel_partners table
CREATE TABLE IF NOT EXISTS `channel_partners` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyRegistration` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'India',
    `baseCommission` DECIMAL(5, 2) NOT NULL,
    `performanceTier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND') NOT NULL DEFAULT 'BRONZE',
    `totalReferrals` INTEGER NOT NULL DEFAULT 0,
    `successfulDeals` INTEGER NOT NULL DEFAULT 0,
    `totalRevenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationDate` DATETIME(3) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `bankIFSC` VARCHAR(191) NULL,
    `panNumber` VARCHAR(191) NULL,
    `gstNumber` VARCHAR(191) NULL,
    `agreementSignedAt` DATETIME(3) NULL,
    `agreementDocument` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `channel_partners_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create partner_referrals table
CREATE TABLE IF NOT EXISTS `partner_referrals` (
    `id` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `leadName` VARCHAR(191) NOT NULL,
    `leadEmail` VARCHAR(191) NOT NULL,
    `leadPhone` VARCHAR(191) NOT NULL,
    `propertyInterest` VARCHAR(191) NULL,
    `budgetRange` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'DEAL_WON', 'DEAL_LOST', 'ON_HOLD') NOT NULL DEFAULT 'NEW',
    `notes` TEXT NULL,
    `commissionEarned` DECIMAL(10, 2) NULL,
    `commissionPaidAt` DATETIME(3) NULL,
    `propertyId` VARCHAR(191) NULL,
    `dealClosedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `partner_referrals_partnerId_fkey`(`partnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `channel_partners`
ADD CONSTRAINT `channel_partners_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `partner_referrals`
ADD CONSTRAINT `partner_referrals_partnerId_fkey`
FOREIGN KEY (`partnerId`) REFERENCES `channel_partners`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Update users table Role enum to include CHANNEL_PARTNER if not present
-- Note: This will show a warning if the value already exists, which is safe to ignore

-- Show the created tables
SHOW TABLES LIKE '%partner%';

-- Describe the new tables
DESCRIBE channel_partners;
DESCRIBE partner_referrals;

SELECT 'Channel Partner tables created successfully!' AS status;
