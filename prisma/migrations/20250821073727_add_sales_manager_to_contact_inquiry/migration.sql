-- AlterTable
ALTER TABLE `contact_inquiries` ADD COLUMN `assignedAt` DATETIME(3) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `priority` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    ADD COLUMN `responseDeadline` DATETIME(3) NULL,
    ADD COLUMN `salesManagerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_salesManagerId_fkey` FOREIGN KEY (`salesManagerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
