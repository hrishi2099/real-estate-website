import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // First, clean up any malformed HTML patterns
  let cleanHTML = html
    // Fix specific malformed patterns we've seen
    .replace(/ullipQuery successful\/p\/li\/ul/g, '<ul><li>Query successful</li></ul>')
    .replace(/ullip/g, '<ul><li>')
    .replace(/\/li\/ul/g, '</li></ul>')
    .replace(/\/p\/li/g, '</li>')
    .replace(/li\/ul/g, '</li></ul>')

    // Fix broken paragraph patterns
    .replace(/\/pp/g, '</p><p>')
    .replace(/pp/g, '<p>')
    .replace(/p \/p/g, '</p><p>')
    .replace(/\/p\/p/g, '</p><p>')

    // Fix standalone text with /p at the end
    .replace(/([^>])\/p(?!\w)/g, '$1</p>')
    .replace(/^p([A-Z])/g, '<p>$1') // Fix paragraphs that start with pCapital

    // Fix broken list patterns
    .replace(/\/p\s*<ul>/g, '</p><ul>')
    .replace(/<\/ul>\s*p/g, '</ul><p>')

    // Clean up multiple consecutive paragraph tags
    .replace(/<\/p>\s*<\/p>/g, '</p>')
    .replace(/<p>\s*<p>/g, '<p>')

    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')

    // Fix any remaining malformed tags
    .replace(/[a-zA-Z]*lip/g, '<li>')
    .replace(/\/p\s*\/li/g, '</li>')
    .replace(/\/p\s*li/g, '</p><li>')

    // Fix broken list endings
    .replace(/li$/g, '</li>')

    // Fix text that looks like broken HTML at the start
    .replace(/^[a-z]+lip/gi, '<li>')

    // Fix orphaned closing tags
    .replace(/^\/p/g, '')
    .replace(/\/p$/g, '</p>')

    // Fix words that got merged with tags
    .replace(/([a-z])\/p([A-Z])/g, '$1</p><p>$2')

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
  let result = sanitized
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  // If we still have malformed HTML after sanitization, fall back to plain text
  if (result.includes('ullip') ||
      result.includes('/p/p') ||
      result.includes('/p') ||
      result.includes('lip') && !result.includes('<li>') ||
      result.includes('ortunity') || // This suggests broken text
      /[a-z]\/p[A-Z]/.test(result) || // Text merged with /p
      /^p[A-Z]/.test(result.trim()) // Paragraph starting with pCapital
  ) {
    result = stripHTML(html);
  }

  return result;
}

export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let text = html
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Fix broken patterns before cleaning
    .replace(/ullipQuery successful\/p\/li\/ul/g, 'Query successful. ')
    .replace(/ullip/g, '• ')
    .replace(/\/p\/li/g, '. ')
    .replace(/\/p/g, '. ')
    .replace(/li\/ul/g, '. ')
    // Clean up entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Fix broken words
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between merged words
    .replace(/ortunity/g, 'opportunity') // Fix specific broken word
    // Clean up spacing
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s*\.\s*/g, '. ')
    .trim();

  // Format as simple paragraphs by adding line breaks after sentences
  text = text
    .replace(/\.\s+([A-Z])/g, '.\n\n$1') // Add paragraph breaks after sentences
    .replace(/:\s*([A-Z])/g, ':\n\n$1') // Add breaks after colons
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