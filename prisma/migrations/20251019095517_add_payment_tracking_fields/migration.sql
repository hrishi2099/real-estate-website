-- AlterTable
ALTER TABLE `payments` ADD COLUMN `payerType` VARCHAR(191) NULL,
    ADD COLUMN `pendingAccount` DECIMAL(12, 2) NULL,
    ADD COLUMN `plotArea` DECIMAL(10, 2) NULL,
    ADD COLUMN `projectName` VARCHAR(191) NULL,
    ADD COLUMN `totalAmount` DECIMAL(12, 2) NULL;
