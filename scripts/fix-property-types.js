const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPropertyTypes() {
  try {
    console.log('🔍 Checking for invalid property types...');

    // Use Prisma's high-level API instead of raw SQL
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        type: true
      }
    });

    console.log(`Found ${allProperties.length} total properties`);

    // Check if there are any invalid types
    const validTypes = ['AGRICULTURAL_LAND', 'NA_LAND'];
    const invalidProperties = allProperties.filter(prop => !validTypes.includes(prop.type));

    console.log(`Found ${invalidProperties.length} properties with invalid types`);

    if (invalidProperties.length > 0) {
      console.log('Invalid properties:', invalidProperties);

      // Update properties one by one
      for (const prop of invalidProperties) {
        let newType = 'AGRICULTURAL_LAND'; // default

        // Map old types to new types
        if (prop.type === 'LAND') {
          newType = 'AGRICULTURAL_LAND';
        } else if (['COMMERCIAL', 'HOUSE', 'VILLA', 'APARTMENT', 'CONDO', 'TOWNHOUSE'].includes(prop.type)) {
          newType = 'NA_LAND';
        }

        try {
          await prisma.property.update({
            where: { id: prop.id },
            data: { type: newType }
          });
          console.log(`✅ Updated property "${prop.title}" from '${prop.type}' to '${newType}'`);
        } catch (updateError) {
          console.error(`❌ Failed to update property ${prop.id}:`, updateError);
        }
      }
    }

    // Verify all properties now have valid types
    const finalProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        type: true
      }
    });

    const stillInvalid = finalProperties.filter(prop => !validTypes.includes(prop.type));

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