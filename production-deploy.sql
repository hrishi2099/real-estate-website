-- Safe production deployment - Only adds financial management tables
-- Run this SQL directly on your production database

-- Step 1: Add ACCOUNTS role to users table
ALTER TABLE `users` MODIFY `role` ENUM('USER', 'ADMIN', 'SALES_MANAGER', 'CHANNEL_PARTNER', 'ACCOUNTS') NOT NULL DEFAULT 'USER';

-- Step 2: Create invoices table
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `customerAddress` TEXT NULL,
    `propertyId` VARCHAR(191) NULL,
    `propertyTitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `taxRate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `taxAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'DRAFT',
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `paidDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    INDEX `invoices_customerId_idx`(`customerId`),
    INDEX `invoices_propertyId_idx`(`propertyId`),
    INDEX `invoices_createdById_idx`(`createdById`),
    INDEX `invoices_status_idx`(`status`),
    INDEX `invoices_issueDate_idx`(`issueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Create payments table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` VARCHAR(191) NOT NULL,
    `paymentNumber` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'NET_BANKING', 'OTHER') NOT NULL,
    `paymentMode` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'ONLINE',
    `referenceNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clearedDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `payments_paymentNumber_key`(`paymentNumber`),
    INDEX `payments_invoiceId_idx`(`invoiceId`),
    INDEX `payments_customerId_idx`(`customerId`),
    INDEX `payments_recordedById_idx`(`recordedById`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_paymentDate_idx`(`paymentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 4: Create commission_payouts table
CREATE TABLE IF NOT EXISTS `commission_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `payoutNumber` VARCHAR(191) NOT NULL,
    `recipientType` ENUM('CHANNEL_PARTNER', 'SALES_MANAGER') NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `taxDeducted` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `netAmount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'NET_BANKING', 'OTHER') NOT NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `bankIFSC` VARCHAR(191) NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `referralIds` TEXT NULL,
    `dealIds` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `commission_payouts_payoutNumber_key`(`payoutNumber`),
    INDEX `commission_payouts_recipientType_idx`(`recipientType`),
    INDEX `commission_payouts_recipientId_idx`(`recipientId`),
    INDEX `commission_payouts_status_idx`(`status`),
    INDEX `commission_payouts_periodStart_periodEnd_idx`(`periodStart`, `periodEnd`),
    INDEX `commission_payouts_approvedById_idx`(`approvedById`),
    INDEX `commission_payouts_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 5: Create transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transactionNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE', 'TRANSFER') NOT NULL,
    `category` ENUM('PROPERTY_SALE', 'COMMISSION_PAYMENT', 'VENDOR_PAYMENT', 'SALARY', 'MARKETING', 'OPERATIONAL', 'OTHER') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `referenceType` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `debitAccount` VARCHAR(191) NULL,
    `creditAccount` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tags` TEXT NULL,
    `attachments` TEXT NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `transactions_transactionNumber_key`(`transactionNumber`),
    INDEX `transactions_type_idx`(`type`),
    INDEX `transactions_category_idx`(`category`),
    INDEX `transactions_status_idx`(`status`),
    INDEX `transactions_transactionDate_idx`(`transactionDate`),
    INDEX `transactions_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 6: Create expenses table
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `expenseNumber` VARCHAR(191) NOT NULL,
    `category` ENUM('MARKETING', 'OPERATIONAL', 'SALARY', 'UTILITIES', 'RENT', 'MAINTENANCE', 'LEGAL', 'TRAVEL', 'OFFICE_SUPPLIES', 'SOFTWARE', 'OTHER') NOT NULL,
    `subcategory` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `vendor` VARCHAR(191) NULL,
    `taxRate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `taxAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'NET_BANKING', 'OTHER') NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `submittedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `expenses_expenseNumber_key`(`expenseNumber`),
    INDEX `expenses_category_idx`(`category`),
    INDEX `expenses_status_idx`(`status`),
    INDEX `expenses_expenseDate_idx`(`expenseDate`),
    INDEX `expenses_approvedById_idx`(`approvedById`),
    INDEX `expenses_submittedById_idx`(`submittedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 7: Add foreign key constraints
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `payments_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `payments_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `commission_payouts` ADD CONSTRAINT `commission_payouts_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `transactions` ADD CONSTRAINT `transactions_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `expenses` ADD CONSTRAINT `expenses_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Insert migration record to mark this as applied
-- Replace YOUR_DATABASE_NAME with your actual production database name
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
VALUES (
    UUID(),
    'b8f7e8a9c5d3f2e1a7b9c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6',
    NOW(3),
    '20251018054644_add_financial_management_tables',
    NULL,
    NULL,
    NOW(3),
    1
);
