import { prisma } from '@/lib/prisma';

/**
 * Fetches the application settings from the database.
 * Caching has been temporarily removed to debug a build issue.
 */
export const getSettings = async () => {
  console.log('Fetching settings...');
  try {
    const settings = await prisma.officeSettings.findFirst();
    console.log('Fetched settings:', settings);
    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};