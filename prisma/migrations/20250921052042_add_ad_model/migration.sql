-- CreateTable
CREATE TABLE `ads` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `ctaText` VARCHAR(191) NOT NULL,
    `ctaLink` VARCHAR(191) NOT NULL,
    `backgroundColor` VARCHAR(191) NULL,
    `textColor` VARCHAR(191) NULL,
    `type` ENUM('BANNER', 'CARD', 'FEATURED') NOT NULL DEFAULT 'CARD',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `clickCount` INTEGER NOT NULL DEFAULT 0,
    `impressionCount` INTEGER NOT NULL DEFAULT 0,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ads_type_isActive_displayOrder_idx`(`type`, `isActive`, `displayOrder`),
    INDEX `ads_startDate_endDate_idx`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
