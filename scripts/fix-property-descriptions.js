const { PrismaClient } = require('@prisma/client');
const DOMPurify = require('isomorphic-dompurify');

const prisma = new PrismaClient();

function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return null;
  }

  // First, clean up any malformed HTML patterns
  let cleanHTML = html
    // Fix broken list tags
    .replace(/ullip/g, '<li>')
    .replace(/\/li\/ul/g, '</li></ul>')
    .replace(/\/p\/li/g, '</li>')
    .replace(/li\/ul/g, '</li></ul>')
    // Fix broken paragraph tags
    .replace(/\/pp/g, '</p><p>')
    .replace(/pp/g, '<p>')
    // Fix standalone closing tags
    .replace(/\/p\/p/g, '</p><p>')
    // Clean up multiple consecutive paragraph tags
    .replace(/<\/p>\s*<\/p>/g, '</p>')
    .replace(/<p>\s*<p>/g, '<p>')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    // Fix any remaining malformed tags
    .replace(/[a-zA-Z]+lip/g, '<li>')
    .replace(/\/p\s*\/li/g, '</li>')
    .trim();

  // Configure DOMPurify to allow safe HTML tags
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false
  };

  // Sanitize the HTML
  const sanitized = DOMPurify.sanitize(cleanHTML, config);

  // Final cleanup to ensure proper structure
  return sanitized
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim() || null;
}

async function fixPropertyDescriptions() {
  try {
    console.log('🔍 Fetching properties with descriptions...');

    const properties = await prisma.property.findMany({
      where: {
        description: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        description: true
      }
    });

    console.log(`📋 Found ${properties.length} properties with descriptions`);

    let fixedCount = 0;

    for (const property of properties) {
      const originalDescription = property.description;
      const cleanDescription = sanitizeHTML(originalDescription);

      // Only update if the description actually changed
      if (cleanDescription !== originalDescription) {
        await prisma.property.update({
          where: { id: property.id },
          data: { description: cleanDescription }
        });

        console.log(`✅ Fixed description for: "${property.title}"`);
        console.log(`   Before: ${originalDescription.substring(0, 100)}...`);
        console.log(`   After:  ${cleanDescription?.substring(0, 100) || 'null'}...`);
        console.log('');

        fixedCount++;
      }
    }

    console.log(`🎉 Successfully fixed ${fixedCount} property descriptions!`);

  } catch (error) {
    console.error('❌ Error fixing property descriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPropertyDescriptions();