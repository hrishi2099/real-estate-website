const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPropertyTypes() {
  try {
    console.log('🔍 Checking for invalid property types...');

    // Find all properties with invalid types
    const invalidProperties = await prisma.$queryRaw`
      SELECT id, title, type FROM Property WHERE type NOT IN ('AGRICULTURAL_LAND', 'NA_LAND')
    `;

    console.log(`Found ${invalidProperties.length} properties with invalid types`);

    if (invalidProperties.length > 0) {
      console.log('Invalid properties:', invalidProperties);

      // Update LAND to AGRICULTURAL_LAND
      const landUpdated = await prisma.$executeRaw`
        UPDATE Property SET type = 'AGRICULTURAL_LAND' WHERE type = 'LAND'
      `;
      console.log(`✅ Updated ${landUpdated} properties from 'LAND' to 'AGRICULTURAL_LAND'`);

      // Update any other common invalid types
      const commercialUpdated = await prisma.$executeRaw`
        UPDATE Property SET type = 'NA_LAND' WHERE type = 'COMMERCIAL'
      `;
      console.log(`✅ Updated ${commercialUpdated} properties from 'COMMERCIAL' to 'NA_LAND'`);

      const houseUpdated = await prisma.$executeRaw`
        UPDATE Property SET type = 'NA_LAND' WHERE type IN ('HOUSE', 'VILLA', 'APARTMENT', 'CONDO', 'TOWNHOUSE')
      `;
      console.log(`✅ Updated ${houseUpdated} residential properties to 'NA_LAND'`);
    }

    // Verify all properties now have valid types
    const stillInvalid = await prisma.$queryRaw`
      SELECT id, title, type FROM Property WHERE type NOT IN ('AGRICULTURAL_LAND', 'NA_LAND')
    `;

    if (stillInvalid.length === 0) {
      console.log('🎉 All property types are now valid!');
    } else {
      console.log('⚠️ Still have invalid properties:', stillInvalid);
    }

  } catch (error) {
    console.error('❌ Error fixing property types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPropertyTypes();