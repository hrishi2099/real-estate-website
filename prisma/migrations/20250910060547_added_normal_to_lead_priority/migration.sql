-- AlterTable
ALTER TABLE `lead_assignments` MODIFY `priority` ENUM('LOW', 'MEDIUM', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM';
