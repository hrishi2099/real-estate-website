-- AlterTable
ALTER TABLE `properties` ADD COLUMN `pricePerSqft` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `properties` MODIFY `type` ENUM('AGRICULTURAL_LAND', 'NA_LAND') NOT NULL;
