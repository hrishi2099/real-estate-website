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
    // Fix broken paragraph tags
    .replace(/\/pp/g, '</p><p>')
    .replace(/pp/g, '<p>')
    .replace(/p \/p/g, '</p><p>')
    // Fix standalone closing tags
    .replace(/\/p\/p/g, '</p><p>')
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
    // Clean up any text that looks like broken HTML
    .replace(/^[a-z]+lip/gi, '<li>')
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
  if (result.includes('ullip') || result.includes('/p/p') || result.includes('lip') && !result.includes('<li>')) {
    result = stripHTML(html);
  }

  return result;
}

export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
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