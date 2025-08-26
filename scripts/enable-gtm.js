// scripts/enable-gtm.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const gtmContainerId = 'GTM-MWW3X4XG';

async function enableGtm() {
  console.log('Attempting to enable Google Tag Manager...');

  try {
    const settings = await prisma.officeSettings.findFirst();

    if (settings) {
      console.log(`Found existing settings (ID: ${settings.id}). Updating...`);
      await prisma.officeSettings.update({
        where: { id: settings.id },
        data: {
          gtmEnabled: true,
          gtmContainerId: gtmContainerId,
        },
      });
      console.log('Successfully updated settings.');
    } else {
      console.log('No existing settings found. Creating new settings...');
      await prisma.officeSettings.create({
        data: {
          gtmEnabled: true,
          gtmContainerId: gtmContainerId,
          companyName: 'Zaminseva Prime', // Default value, you can change this later
        },
      });
      console.log('Successfully created new settings.');
    }

    console.log(`Google Tag Manager has been enabled with ID: ${gtmContainerId}`);

  } catch (error) {
    console.error('An error occurred while enabling Google Tag Manager:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

enableGtm();
