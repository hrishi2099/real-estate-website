import { prisma } from '@/lib/prisma';

/**
 * Fetches the application settings from the database.
 * Caching has been temporarily removed to debug a build issue.
 */
export const getSettings = async () => {
  const settings = await prisma.officeSettings.findFirst();
  return settings;
};