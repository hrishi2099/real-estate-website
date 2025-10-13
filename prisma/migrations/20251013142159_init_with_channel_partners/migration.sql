-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'SALES_MANAGER', 'CHANNEL_PARTNER') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `territory` VARCHAR(191) NULL,
    `commission` DECIMAL(5, 2) NULL,
    `managerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_managerId_fkey`(`managerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_partners` (
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
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `channel_partners_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_referrals` (
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
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `partner_referrals_partnerId_fkey`(`partnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `type` ENUM('AGRICULTURAL_LAND', 'NA_LAND') NOT NULL,
    `status` ENUM('ACTIVE', 'SOLD', 'PENDING', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `area` DECIMAL(10, 2) NULL,
    `yearBuilt` INTEGER NULL,
    `features` TEXT NULL,
    `ownerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pricePerSqft` DECIMAL(10, 2) NULL,
    `plotCount` INTEGER NULL,
    `kmlFileUrl` TEXT NULL,
    `kmlContent` LONGTEXT NULL,

    INDEX `properties_ownerId_fkey`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `propertyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `property_images_propertyId_fkey`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('PENDING', 'RESPONDED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `userId` VARCHAR(191) NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `inquiries_propertyId_fkey`(`propertyId`),
    INDEX `inquiries_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_propertyId_fkey`(`propertyId`),
    UNIQUE INDEX `favorites_userId_propertyId_key`(`userId`, `propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_analytics` (
    `id` VARCHAR(191) NOT NULL,
    `event` ENUM('VIEW', 'CONTACT', 'FAVORITE', 'SHARE') NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `property_analytics_propertyId_fkey`(`propertyId`),
    INDEX `property_analytics_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'REVIEWED', 'RESPONDED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `assignedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `priority` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `responseDeadline` DATETIME(3) NULL,
    `salesManagerId` VARCHAR(191) NULL,

    INDEX `contact_inquiries_salesManagerId_fkey`(`salesManagerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `office_settings` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `mondayHours` VARCHAR(191) NULL,
    `tuesdayHours` VARCHAR(191) NULL,
    `wednesdayHours` VARCHAR(191) NULL,
    `thursdayHours` VARCHAR(191) NULL,
    `fridayHours` VARCHAR(191) NULL,
    `saturdayHours` VARCHAR(191) NULL,
    `sundayHours` VARCHAR(191) NULL,
    `gtmContainerId` VARCHAR(191) NULL,
    `gtmEnabled` BOOLEAN NULL DEFAULT false,
    `ga4MeasurementId` VARCHAR(191) NULL,
    `ga4Enabled` BOOLEAN NULL DEFAULT false,
    `facebookPixelId` VARCHAR(191) NULL,
    `facebookPixelEnabled` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `googleAdsEnabled` BOOLEAN NULL DEFAULT false,
    `googleAdsId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `tableName` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NULL,
    `oldValues` TEXT NULL,
    `newValues` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `userEmail` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_scores` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `grade` ENUM('COLD', 'WARM', 'HOT', 'QUALIFIED') NOT NULL DEFAULT 'COLD',
    `propertyViews` INTEGER NOT NULL DEFAULT 0,
    `inquiriesMade` INTEGER NOT NULL DEFAULT 0,
    `contactFormSubmissions` INTEGER NOT NULL DEFAULT 0,
    `favoritesSaved` INTEGER NOT NULL DEFAULT 0,
    `avgSessionDuration` INTEGER NULL,
    `returnVisits` INTEGER NOT NULL DEFAULT 0,
    `priceRangeSearches` TEXT NULL,
    `locationSearches` TEXT NULL,
    `propertyTypeInterests` TEXT NULL,
    `lastActivity` DATETIME(3) NULL,
    `daysActive` INTEGER NOT NULL DEFAULT 0,
    `budgetEstimate` DECIMAL(12, 2) NULL,
    `seriousBuyerIndicator` BOOLEAN NOT NULL DEFAULT false,
    `lastCalculated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lead_scores_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_activities` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activityType` ENUM('PROPERTY_VIEW', 'PROPERTY_INQUIRY', 'CONTACT_FORM', 'FAVORITE_ADDED', 'SEARCH_PERFORMED', 'RETURN_VISIT', 'PHONE_CALL_MADE', 'EMAIL_OPENED', 'BROCHURE_DOWNLOADED') NOT NULL,
    `propertyId` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_activities_propertyId_fkey`(`propertyId`),
    INDEX `lead_activities_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `salesManagerId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `expectedCloseDate` DATETIME(3) NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',

    INDEX `lead_assignments_salesManagerId_fkey`(`salesManagerId`),
    UNIQUE INDEX `lead_assignments_leadId_salesManagerId_key`(`leadId`, `salesManagerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pipeline_stages` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `stage` ENUM('NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'PROPERTY_VIEWING', 'APPLICATION', 'CLOSING', 'WON', 'LOST', 'ON_HOLD') NOT NULL,
    `enteredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `exitedAt` DATETIME(3) NULL,
    `durationHours` INTEGER NULL,
    `notes` TEXT NULL,
    `probability` INTEGER NULL,
    `estimatedValue` DECIMAL(12, 2) NULL,
    `nextAction` VARCHAR(191) NULL,
    `nextActionDate` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,

    INDEX `pipeline_stages_assignmentId_fkey`(`assignmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pipeline_activities` (
    `id` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,
    `activityType` ENUM('PHONE_CALL', 'EMAIL_SENT', 'EMAIL_RECEIVED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED', 'PROPERTY_SHOWING', 'PROPOSAL_SENT', 'FOLLOW_UP', 'DOCUMENT_RECEIVED', 'APPLICATION_SUBMITTED', 'NEGOTIATION', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PAYMENT_RECEIVED', 'DEAL_CLOSED', 'DEAL_LOST', 'NOTE_ADDED') NOT NULL,
    `description` TEXT NOT NULL,
    `outcome` TEXT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pipeline_activities_stageId_fkey`(`stageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `eventType` ENUM('MEETING', 'PROPERTY_VIEWING', 'FOLLOW_UP', 'CALL', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `salesManagerId` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `propertyId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `calendar_events_leadId_fkey`(`leadId`),
    INDEX `calendar_events_propertyId_fkey`(`propertyId`),
    INDEX `calendar_events_salesManagerId_fkey`(`salesManagerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rcs_messages` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `richContent` TEXT NULL,
    `messageType` ENUM('TEXT', 'RICH_TEXT', 'IMAGE', 'VIDEO', 'CARD', 'CAROUSEL', 'QUICK_REPLY', 'SUGGESTION') NOT NULL DEFAULT 'TEXT',
    `templateId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `targetAudience` ENUM('ALL_USERS', 'LEADS_ONLY', 'SALES_MANAGERS', 'CUSTOM_LIST', 'PROPERTY_INQUIRERS', 'ACTIVE_USERS') NOT NULL DEFAULT 'ALL_USERS',
    `createdById` VARCHAR(191) NOT NULL,
    `personalizationData` TEXT NULL,
    `aiGenerated` BOOLEAN NOT NULL DEFAULT false,
    `aiPrompt` TEXT NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    `campaignId` VARCHAR(191) NULL,
    `abTestGroup` VARCHAR(191) NULL,
    `abTestVariant` VARCHAR(191) NULL,
    `conversionGoal` VARCHAR(191) NULL,
    `geoTargeting` TEXT NULL,
    `timezone` VARCHAR(191) NULL,
    `expectedCTR` DECIMAL(5, 2) NULL,
    `actualCTR` DECIMAL(5, 2) NULL,
    `engagementScore` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rcs_messages_abTestGroup_fkey`(`abTestGroup`),
    INDEX `rcs_messages_campaignId_fkey`(`campaignId`),
    INDEX `rcs_messages_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rcs_recipients` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'CLICKED', 'FAILED', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    `sentAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `clickedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rcs_recipients_userId_fkey`(`userId`),
    UNIQUE INDEX `rcs_recipients_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `richContent` TEXT NULL,
    `messageType` ENUM('TEXT', 'RICH_TEXT', 'IMAGE', 'VIDEO', 'CARD', 'CAROUSEL', 'QUICK_REPLY', 'SUGGESTION') NOT NULL DEFAULT 'TEXT',
    `category` ENUM('GENERAL', 'MARKETING', 'NOTIFICATION', 'WELCOME', 'PROPERTY_UPDATE', 'APPOINTMENT', 'FOLLOW_UP') NOT NULL DEFAULT 'GENERAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `message_templates_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_delivery_reports` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `totalSent` INTEGER NOT NULL DEFAULT 0,
    `totalDelivered` INTEGER NOT NULL DEFAULT 0,
    `totalRead` INTEGER NOT NULL DEFAULT 0,
    `totalClicked` INTEGER NOT NULL DEFAULT 0,
    `totalFailed` INTEGER NOT NULL DEFAULT 0,
    `deliveryRate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `openRate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `clickRate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_delivery_reports_messageId_fkey`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `budget` DECIMAL(10, 2) NULL,
    `targetMetrics` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `campaigns_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ab_tests` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `variants` TEXT NOT NULL,
    `trafficSplit` TEXT NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'RUNNING',
    `winnerVariant` VARCHAR(191) NULL,
    `confidenceLevel` DECIMAL(5, 2) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `campaignId` VARCHAR(191) NULL,

    INDEX `ab_tests_campaignId_fkey`(`campaignId`),
    INDEX `ab_tests_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_interactions` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `interactionType` ENUM('DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'SHARED', 'SAVED', 'DISMISSED', 'BLOCKED', 'CONVERTED') NOT NULL,
    `data` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deviceInfo` TEXT NULL,
    `location` VARCHAR(191) NULL,

    INDEX `message_interactions_messageId_fkey`(`messageId`),
    INDEX `message_interactions_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `smart_segments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `criteria` TEXT NOT NULL,
    `estimatedSize` INTEGER NULL,
    `actualSize` INTEGER NULL,
    `refreshSchedule` VARCHAR(191) NULL,
    `lastRefreshed` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `smart_segments_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_automations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `trigger` ENUM('USER_SIGNUP', 'PROPERTY_VIEW', 'INQUIRY_SUBMITTED', 'LEAD_SCORE_CHANGE', 'APPOINTMENT_SCHEDULED', 'DEAL_CLOSED', 'INACTIVITY_DETECTED', 'BIRTHDAY', 'ANNIVERSARY', 'CUSTOM_EVENT') NOT NULL,
    `triggerData` TEXT NOT NULL,
    `messageTemplate` TEXT NOT NULL,
    `conditions` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `executionCount` INTEGER NOT NULL DEFAULT 0,
    `lastExecuted` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `message_automations_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    INDEX `ads_createdBy_fkey`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memorable_moments` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageData` LONGBLOB NULL,
    `imageMimeType` VARCHAR(191) NULL,
    `imageSize` INTEGER NULL,
    `date` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `memorable_moments_displayOrder_isActive_idx`(`displayOrder`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memorable_moments_section` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_fkey`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `source` VARCHAR(191) NOT NULL DEFAULT 'Excel Upload',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `avgSessionDuration` INTEGER NULL,
    `budgetEstimate` DECIMAL(12, 2) NULL,
    `contactFormSubmissions` INTEGER NOT NULL DEFAULT 0,
    `daysActive` INTEGER NOT NULL DEFAULT 0,
    `favoritesSaved` INTEGER NOT NULL DEFAULT 0,
    `grade` ENUM('COLD', 'WARM', 'HOT', 'QUALIFIED') NOT NULL DEFAULT 'COLD',
    `inquiriesMade` INTEGER NOT NULL DEFAULT 0,
    `lastActivity` DATETIME(3) NULL,
    `lastCalculated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `locationSearches` TEXT NULL,
    `priceRangeSearches` TEXT NULL,
    `propertyTypeInterests` TEXT NULL,
    `propertyViews` INTEGER NOT NULL DEFAULT 0,
    `returnVisits` INTEGER NOT NULL DEFAULT 0,
    `score` INTEGER NOT NULL DEFAULT 0,
    `seriousBuyerIndicator` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_partners` ADD CONSTRAINT `channel_partners_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_referrals` ADD CONSTRAINT `partner_referrals_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `channel_partners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_analytics` ADD CONSTRAINT `property_analytics_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_analytics` ADD CONSTRAINT `property_analytics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_salesManagerId_fkey` FOREIGN KEY (`salesManagerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_scores` ADD CONSTRAINT `lead_scores_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_salesManagerId_fkey` FOREIGN KEY (`salesManagerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pipeline_stages` ADD CONSTRAINT `pipeline_stages_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `lead_assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pipeline_activities` ADD CONSTRAINT `pipeline_activities_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `pipeline_stages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_salesManagerId_fkey` FOREIGN KEY (`salesManagerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcs_messages` ADD CONSTRAINT `rcs_messages_abTestGroup_fkey` FOREIGN KEY (`abTestGroup`) REFERENCES `ab_tests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcs_messages` ADD CONSTRAINT `rcs_messages_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcs_messages` ADD CONSTRAINT `rcs_messages_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcs_recipients` ADD CONSTRAINT `rcs_recipients_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `rcs_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rcs_recipients` ADD CONSTRAINT `rcs_recipients_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_templates` ADD CONSTRAINT `message_templates_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_delivery_reports` ADD CONSTRAINT `message_delivery_reports_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `rcs_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ab_tests` ADD CONSTRAINT `ab_tests_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ab_tests` ADD CONSTRAINT `ab_tests_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_interactions` ADD CONSTRAINT `message_interactions_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `rcs_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_interactions` ADD CONSTRAINT `message_interactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `smart_segments` ADD CONSTRAINT `smart_segments_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_automations` ADD CONSTRAINT `message_automations_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

