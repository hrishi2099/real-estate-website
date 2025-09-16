/**
 * Centralized image URL handling utility
 * Automatically converts relative /uploads/ paths to absolute URLs for production
 */

export function getImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-property.jpg';
  }

  // If URL already starts with http/https, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle relative uploads paths
  if (url.startsWith('/uploads/')) {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || '';
    return `${baseUrl}${url}`;
  }

  // Handle other relative paths
  if (url.startsWith('/')) {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || '';
    return `${baseUrl}${url}`;
  }

  // Return URL as-is if it doesn't match any patterns
  return url;
}

export function getPropertyImageUrl(property: {
  images?: { id: string; url: string; isPrimary: boolean }[];
}): string {
  const primaryImage = property.images?.find(img => img.isPrimary);
  const imageUrl = primaryImage?.url || property.images?.[0]?.url;

  if (imageUrl) {
    return getImageUrl(imageUrl);
  }

  // Fallback to placeholder
  return '/placeholder-property.jpg';
}