-- AlterTable
ALTER TABLE `office_settings` ADD COLUMN `googleAdsEnabled` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `googleAdsId` VARCHAR(191) NULL;
