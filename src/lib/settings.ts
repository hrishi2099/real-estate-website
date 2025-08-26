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
    const settings = await prisma.officeSettings.findFirst({
      select: {
        // Fields for Header, Footer, and general UI
        companyName: true,
        logoUrl: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        // Fields for AnalyticsScripts
        gtmEnabled: true,
        gtmContainerId: true,
        ga4Enabled: true,
        ga4MeasurementId: true,
        facebookPixelEnabled: true,
        facebookPixelId: true,
        googleAdsEnabled: true,
        googleAdsId: true,
      },
    });
    return settings;
  },
  ['settings'], // Cache key
  { tags: ['settings'] } // Cache tag for revalidation
);