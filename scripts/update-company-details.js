const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCompanyDetails() {
  try {
    console.log('Updating company details...');

    const result = await prisma.officeSettings.update({
      where: { id: 'default' },
      data: {
        companyName: 'Zaminseva Prime Pvt. Ltd.',
        email: 'info@zaminseva.com',
        website: 'https://zaminseva.com'
      }
    });

    console.log('✅ Company details updated successfully:');
    console.log('  Company Name:', result.companyName);
    console.log('  Email:', result.email);
    console.log('  Website:', result.website);
  } catch (error) {
    console.error('❌ Error updating company details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyDetails();