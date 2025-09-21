const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCompanyName() {
  try {
    console.log('Updating company name to "Zaminseva Prime Pvt. Ltd."...');

    const result = await prisma.officeSettings.update({
      where: { id: 'default' },
      data: {
        companyName: 'Zaminseva Prime Pvt. Ltd.'
      }
    });

    console.log('✅ Company name updated successfully:', result.companyName);
  } catch (error) {
    console.error('❌ Error updating company name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyName();