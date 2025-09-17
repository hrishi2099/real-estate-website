import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove unwanted debug text first
  html = html.replace(/Query successful\.?\s*/gi, '');

  // Check if the HTML is too malformed and should be converted to plain text
  if (shouldConvertToPlainText(html)) {
    return stripHTML(html);
  }

  // Try to fix the HTML first
  let cleanHTML = fixMalformedHTML(html);

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

  // Final cleanup
  let result = sanitized
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  // If we still have malformed patterns after all processing, fall back to plain text
  if (shouldConvertToPlainText(result)) {
    result = stripHTML(html);
  }

  return result;
}

function shouldConvertToPlainText(html: string): boolean {
  const malformedPatterns = [
    /ullip/,
    /\/p(?!>)/,  // /p not followed by >
    /\blip(?!\s|>)/,  // lip not followed by space or >
    /p\s+[A-Z]/,  // p followed by space and capital letter
    /\/ulp/,
    /oppopportunity/,  // doubled words
    /[a-z]\/p[A-Z]/,  // text/pText pattern
  ];

  return malformedPatterns.some(pattern => pattern.test(html));
}

function fixMalformedHTML(html: string): string {
  return html
    // Remove unwanted debug/system text first
    .replace(/Query successful\.?\s*/gi, '')
    .replace(/ullipQuery successful\/p\/li\/ul/g, '')

    // Fix specific known malformed patterns
    .replace(/ullip/g, '<ul><li>')
    .replace(/\/li\/ul/g, '</li></ul>')
    .replace(/\/ulp/g, '</ul>')
    .replace(/lip/g, '<li>')

    // Fix paragraph patterns
    .replace(/\/pp/g, '</p><p>')
    .replace(/\bp\s+([A-Z])/g, '<p>$1')  // p followed by space and capital
    .replace(/([.!?])\s*\/p\s*/g, '$1</p>')  // sentence followed by /p
    .replace(/\/p([A-Z])/g, '</p><p>$1')  // /p followed by capital letter

    // Fix broken words
    .replace(/oppopportunity/g, 'opportunity')
    .replace(/farmho$/g, 'farmhouse')  // Cut off words

    // Clean up extra spaces and malformed tags
    .replace(/\s+/g, ' ')
    .replace(/(<\/?)p\s+/g, '$1p')  // Remove spaces after opening tags
    .trim();
}

export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let text = html
    // Remove HTML tags first
    .replace(/<[^>]*>/g, ' ')

    // Remove unwanted debug/system text
    .replace(/Query successful\.?\s*/gi, '')
    .replace(/ullipQuery successful\/p\/li\/ul/g, '')

    // Fix specific malformed patterns
    .replace(/ullip/g, '\n• ')
    .replace(/lip/g, '\n• ')
    .replace(/\/ulp/g, '')
    .replace(/\/p\/li/g, '')
    .replace(/\/p/g, '')
    .replace(/li\/ul/g, '')

    // Fix specific text patterns we see
    .replace(/p\s+([A-Z])/g, '\n\n$1')  // "p Zamin" -> paragraph break + "Zamin"
    .replace(/\.\s*p\s+/g, '.\n\n')      // ". p " -> paragraph break
    .replace(/:\s*\.\s*/g, ':\n')        // ": ." -> colon + line break

    // Fix broken words and duplicates
    .replace(/oppopportunity/g, 'opportunity')
    .replace(/farmho\b/g, 'farmhouse')
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between merged words

    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

    // Clean up punctuation and spacing
    .replace(/\s*\.\s*\./g, '.')         // Remove double periods
    .replace(/\s*\.\s*/g, '. ')          // Normalize period spacing
    .replace(/\s+/g, ' ')                // Normalize white space
    .replace(/\s*\n\s*/g, '\n')          // Clean line breaks
    .replace(/\n{3,}/g, '\n\n')          // Max 2 consecutive line breaks
    .trim();

  // Format into proper paragraphs
  text = text
    .replace(/\.\s*([A-Z])/g, '.\n\n$1')  // Paragraph breaks after sentences
    .replace(/:\s*([A-Z])/g, ':\n\n$1')   // Paragraph breaks after colons
    .replace(/\n•/g, '\n\n•')             // Ensure bullet points have space above
    .replace(/\n\n\n+/g, '\n\n')          // Clean up extra line breaks
    .trim();

  return text;
}

export function isValidHTML(html: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return !doc.querySelector('parsererror');
  } catch {
    return false;
  }
}