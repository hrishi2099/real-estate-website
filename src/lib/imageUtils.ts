/**
 * Centralized image URL handling utility
 * Automatically converts relative /uploads/ paths to absolute URLs for production
 */

export function getImageUrl(url: string | null | undefined): string {
  const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';

  if (!url || url.trim() === '') {
    return fallbackImage;
  }

  // If URL already starts with http/https, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle relative uploads paths
  if (url.startsWith('/uploads/') || url.startsWith('/')) {
    let baseUrl = '';

    if (typeof window !== 'undefined') {
      // Client-side: use window.location.origin
      baseUrl = window.location.origin;
    } else {
      // Server-side: use environment variable with production fallback
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com';
    }

    // Ensure no double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${baseUrl}${cleanUrl}`;

    return fullUrl;
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
  return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80';
}