const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateMemorableMoments() {
  try {
    console.log('Starting memorable moments migration...');

    // Read the existing JSON data
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'memorableMoments.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log('JSON data loaded successfully');

    // Check if section already exists
    let sectionInfo = await prisma.memorableMomentsSection.findFirst();

    if (!sectionInfo) {
      // Create section info
      sectionInfo = await prisma.memorableMomentsSection.create({
        data: {
          title: jsonData.sectionInfo.title,
          subtitle: jsonData.sectionInfo.subtitle,
          description: jsonData.sectionInfo.description
        }
      });
      console.log('Section info created');
    } else {
      console.log('Section info already exists');
    }

    // Check if events already exist
    const existingEvents = await prisma.memorableMoment.findMany();

    if (existingEvents.length === 0) {
      // Create events
      for (let i = 0; i < jsonData.events.length; i++) {
        const event = jsonData.events[i];
        await prisma.memorableMoment.create({
          data: {
            title: event.title,
            description: event.description,
            imageUrl: event.url,
            date: event.date,
            category: event.category,
            displayOrder: i,
            isActive: true
          }
        });
      }
      console.log(`Created ${jsonData.events.length} memorable moments`);
    } else {
      console.log('Events already exist');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateMemorableMoments();