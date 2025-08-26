import { prisma } from '@/lib/prisma';
import type { OfficeSettings } from '@prisma/client';

// Define a type for the settings we are fetching to ensure type safety
type SelectedSettings = Pick<
  OfficeSettings,
  | 'companyName'
  | 'logoUrl'
  | 'address'
  | 'phone'
  | 'email'
  | 'website'
  | 'gtmEnabled'
  | 'gtmContainerId'
  | 'ga4Enabled'
  | 'ga4MeasurementId'
  | 'facebookPixelEnabled'
  | 'facebookPixelId'
  | 'googleAdsEnabled'
  | 'googleAdsId'
>;

/**
 * Fetches the application settings from the database.
 * Caching has been temporarily removed to debug a build issue.
 */
export const getSettings = async (): Promise<SelectedSettings | null> => {
  const settings = await prisma.officeSettings.findFirst({
    select: {
      companyName: true,
      logoUrl: true,
      address: true,
      phone: true,
      email: true,
      website: true,
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
};
