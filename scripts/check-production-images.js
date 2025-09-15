const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkProductionImages() {
  try {
    console.log('🔍 Checking production image setup...');

    // Check if uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadsExists = fs.existsSync(uploadsDir);
    console.log(`📁 Uploads directory exists: ${uploadsExists}`);
    console.log(`📍 Uploads path: ${uploadsDir}`);

    if (uploadsExists) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`📊 Files in uploads: ${files.length}`);
      console.log('📋 First 10 files:', files.slice(0, 10));
    }

    // Check property images in database
    const properties = await prisma.property.findMany({
      include: {
        images: true
      }
    });

    console.log(`\n🏠 Total properties: ${properties.length}`);

    const propertiesWithImages = properties.filter(p => p.images.length > 0);
    console.log(`📸 Properties with images: ${propertiesWithImages.length}`);

    // Check image URLs
    let validImages = 0;
    let invalidImages = 0;
    let externalImages = 0;

    properties.forEach(property => {
      property.images.forEach(image => {
        if (image.url.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', image.url);
          if (fs.existsSync(filePath)) {
            validImages++;
          } else {
            invalidImages++;
            console.log(`❌ Missing file: ${image.url}`);
          }
        } else if (image.url.startsWith('http')) {
          externalImages++;
        }
      });
    });

    console.log(`\n📊 Image Status:`);
    console.log(`✅ Valid local images: ${validImages}`);
    console.log(`❌ Invalid local images: ${invalidImages}`);
    console.log(`🌐 External images: ${externalImages}`);

    // Check recent image URLs
    const recentImages = await prisma.propertyImage.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    console.log(`\n🔗 Recent image URLs:`);
    recentImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.url}`);
    });

  } catch (error) {
    console.error('❌ Error checking images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionImages();