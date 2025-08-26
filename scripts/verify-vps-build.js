const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function verify() {
  console.log('--- Step 1: Forcing Prisma Client regeneration ---');
  try {
    const output = execSync('npx prisma generate', { encoding: 'utf-8' });
    console.log(output);
    console.log('--- Prisma Client regenerated successfully ---');
  } catch (e) {
    console.error('!!! FAILED to regenerate Prisma Client !!!');
    console.error(e);
    process.exit(1);
  }

  console.log('\n--- Step 2: Connecting to database and fetching settings ---');
  const prisma = new PrismaClient();
  try {
    const settings = await prisma.officeSettings.findFirst();
    
    if (!settings) {
      console.log('!!! No settings found in the database !!!');
      return;
    }

    console.log('--- Settings object from database: ---');
    console.log(settings);
    console.log('\n--- Checking for required fields: ---');
    const requiredKeys = ['googleAdsEnabled', 'googleAdsId'];
    let allKeysFound = true;
    for (const key of requiredKeys) {
      const hasKey = Object.prototype.hasOwnProperty.call(settings, key);
      console.log(`- Has '${key}'? ${hasKey}`);
      if (!hasKey) {
        allKeysFound = false;
      }
    }

    if (allKeysFound) {
      console.log('\nSUCCESS: The settings object from the database contains all the required fields.');
    } else {
      console.log('\n!!! ERROR: The settings object from the database is MISSING required fields. This suggests the database schema is not up to date. Please ensure you have run "npx prisma migrate deploy".');
    }

  } catch (error) {
    console.error('!!! An error occurred while fetching settings: !!!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
