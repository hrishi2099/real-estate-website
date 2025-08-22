import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Fetches the application settings from the database.
 * This function is cached to avoid repeated database calls across the application
 * during a single request lifecycle. The cache is revalidated on-demand
 * when settings are updated.
 */
export const getSettings = unstable_cache(
  async () => {
    console.log('Fetching settings from database...');
    const settings = await prisma.officeSettings.findFirst();
    console.log('Settings fetched from database:', settings);
    return settings;
  },
  ['settings'], // Cache key
  { tags: ['settings'] } // Cache tag for revalidation
);