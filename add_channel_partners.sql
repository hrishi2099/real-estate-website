-- Migration: Add Channel Partner System
-- This adds only the new channel partner tables and enums to existing database

-- Add new role to existing Role enum
ALTER TABLE `users` MODIFY `role` ENUM('USER', 'ADMIN', 'SALES_MANAGER', 'CHANNEL_PARTNER') NOT NULL DEFAULT 'USER';

-- Create PerformanceTier enum (used in channel_partners table)
-- Note: MySQL doesn't have native enum types, we'll use it as a column enum

-- Create PartnerStatus enum
-- Note: MySQL doesn't have native enum types, we'll use it as a column enum

-- Create ReferralStatus enum
-- Note: MySQL doesn't have native enum types, we'll use it as a column enum

-- Create channel_partners table
CREATE TABLE `channel_partners` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyAddress` VARCHAR(191) NOT NULL,
    `gstNumber` VARCHAR(191) NULL,
    `panNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `accountHolderName` VARCHAR(191) NULL,
    `baseCommission` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    `performanceTier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND') NOT NULL DEFAULT 'BRONZE',
    `totalReferrals` INTEGER NOT NULL DEFAULT 0,
    `successfulDeals` INTEGER NOT NULL DEFAULT 0,
    `totalRevenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `totalCommissionEarned` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `totalCommissionPaid` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `pendingCommission` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'PENDING',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `channel_partners_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create partner_referrals table
CREATE TABLE `partner_referrals` (
    `id` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `leadName` VARCHAR(191) NOT NULL,
    `leadEmail` VARCHAR(191) NOT NULL,
    `leadPhone` VARCHAR(191) NOT NULL,
    `propertyInterest` VARCHAR(191) NULL,
    `budgetRange` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'DEAL_WON', 'DEAL_LOST', 'ON_HOLD') NOT NULL DEFAULT 'NEW',
    `dealValue` DECIMAL(15, 2) NULL,
    `commissionAmount` DECIMAL(15, 2) NULL,
    `commissionPaid` BOOLEAN NOT NULL DEFAULT false,
    `commissionPaidDate` DATETIME(3) NULL,
    `paymentTransactionId` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `partner_referrals_partnerId_idx`(`partnerId`),
    INDEX `partner_referrals_status_idx`(`status`),
    INDEX `partner_referrals_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys
ALTER TABLE `channel_partners` ADD CONSTRAINT `channel_partners_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `partner_referrals` ADD CONSTRAINT `partner_referrals_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `channel_partners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
