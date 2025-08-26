// scripts/verify-analytics-settings.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySettings() {
  console.log('Fetching analytics settings from the database...');

  try {
    const settings = await prisma.officeSettings.findFirst({
      select: {
        gtmEnabled: true,
        gtmContainerId: true,
        ga4Enabled: true,
        ga4MeasurementId: true,
        facebookPixelEnabled: true,
        facebookPixelId: true,
        googleAdsEnabled: true,
        googleAdsId: true,
      }
    });

    if (settings) {
      console.log('Current Analytics Settings:');
      console.log('---------------------------');
      console.log(`Google Tag Manager Enabled: ${settings.gtmEnabled}`);
      console.log(`Google Tag Manager ID:      ${settings.gtmContainerId || 'Not Set'}`);
      console.log('---------------------------');
      console.log(`Google Analytics 4 Enabled: ${settings.ga4Enabled}`);
      console.log(`Google Analytics 4 ID:      ${settings.ga4MeasurementId || 'Not Set'}`);
      console.log('---------------------------');
      console.log(`Facebook Pixel Enabled:     ${settings.facebookPixelEnabled}`);
      console.log(`Facebook Pixel ID:          ${settings.facebookPixelId || 'Not Set'}`);
      console.log('---------------------------');
      console.log(`Google Ads Enabled:         ${settings.googleAdsEnabled}`);
      console.log(`Google Ads ID:              ${settings.googleAdsId || 'Not Set'}`);
      console.log('---------------------------');
    } else {
      console.log('No office settings found in the database.');
    }

  } catch (error) {
    console.error('An error occurred while fetching settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySettings();
