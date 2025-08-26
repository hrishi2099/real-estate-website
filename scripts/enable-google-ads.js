// scripts/enable-google-ads.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const googleAdsId = 'AW-17207639399';

async function enableGoogleAds() {
  console.log('Attempting to enable Google Ads tracking...');

  try {
    const settings = await prisma.officeSettings.findFirst();

    if (settings) {
      console.log(`Found existing settings (ID: ${settings.id}). Updating...`);
      await prisma.officeSettings.update({
        where: { id: settings.id },
        data: {
          googleAdsEnabled: true,
          googleAdsId: googleAdsId,
        },
      });
      console.log('Successfully updated settings.');
    } else {
      console.log('No existing settings found. Creating new settings...');
      await prisma.officeSettings.create({
        data: {
          googleAdsEnabled: true,
          googleAdsId: googleAdsId,
          companyName: 'Zaminseva Prime', // Default value, you can change this later
        },
      });
      console.log('Successfully created new settings.');
    }

    console.log(`Google Ads tracking has been enabled with ID: ${googleAdsId}`);

  } catch (error) {
    console.error('An error occurred while enabling Google Ads:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

enableGoogleAds();
