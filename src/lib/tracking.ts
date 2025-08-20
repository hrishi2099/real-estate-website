/**
 * This module contains functions for tracking user events on the client-side.
 * It interfaces with Google Tag Manager (GTM), Google Analytics (GA4), and Facebook Pixel.
 * These functions are safe to call from any client component.
 */

/**
 * A generic event tracking function that pushes data to GTM, GA4, and Facebook Pixel if they are available on the window object.
 * @param eventName - The name of the event to track.
 * @param parameters - An object of key-value pairs to send with the event.
 */
export const trackEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
) => {
  // This function is client-side only. Do nothing on the server.
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const enrichedParameters = {
      ...parameters,
      timestamp: new Date().toISOString(),
      page_location: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    };

    // GTM dataLayer event
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...enrichedParameters,
      });
    }

    // Direct GA4 event
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, enrichedParameters);
    }

    // Facebook Pixel event
    if ((window as any).fbq) {
      const fbEventName =
        eventName === 'page_view'
          ? 'PageView'
          : eventName === 'purchase'
          ? 'Purchase'
          : eventName === 'lead'
          ? 'Lead'
          : eventName === 'search'
          ? 'Search'
          : eventName === 'view_content'
          ? 'ViewContent'
          : 'CustomEvent';

      if (fbEventName === 'CustomEvent') {
        (window as any).fbq('trackCustom', eventName, enrichedParameters);
      } else {
        (window as any).fbq('track', fbEventName, enrichedParameters);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Analytics Event:', eventName, enrichedParameters);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// --- Specific Event Tracking Helpers ---

export const trackPropertyView = (
  propertyId: string,
  propertyTitle: string,
  price: number
) => {
  trackEvent('property_view', {
    property_id: propertyId,
    property_title: propertyTitle,
    value: price,
    currency: 'INR',
  });
};

export const trackPropertyInquiry = (
  propertyId: string,
  propertyTitle: string,
  inquiryType: string
) => {
  trackEvent('property_inquiry', {
    property_id: propertyId,
    property_title: propertyTitle,
    inquiry_type: inquiryType,
  });
};

export const trackContactSubmission = (source: string) => {
  trackEvent('contact_form_submit', {
    form_source: source,
  });
};

export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  });
};

export const trackNavigation = (
  linkText: string,
  destination: string,
  section: string
) => {
  trackEvent('navigation_click', {
    link_text: linkText,
    link_destination: destination,
    nav_section: section,
  });
};

export const trackSearch = (
  searchTerm: string,
  filters: Record<string, any> = {},
  resultsCount?: number
) => {
  trackEvent('search', {
    search_term: searchTerm,
    search_filters: JSON.stringify(filters),
    results_count: resultsCount,
    search_type: 'property_search',
  });
};

export const trackFilterUsage = (
  filterType: string,
  filterValue: any,
  activeFilters: Record<string, any>
) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: String(filterValue),
    all_active_filters: JSON.stringify(activeFilters),
    total_active_filters: Object.keys(activeFilters).length,
  });
};

export const trackButtonClick = (
  buttonText: string,
  buttonType: string,
  context?: string
) => {
  trackEvent('button_click', {
    button_text: buttonText,
    button_type: buttonType,
    button_context: context || 'unknown',
  });
};

export const trackShare = (
  contentType: string,
  contentId: string,
  shareMethod: string
) => {
  trackEvent('content_share', {
    content_type: contentType, // 'property', 'page', 'listing'
    content_id: contentId,
    share_method: shareMethod, // 'facebook', 'twitter', 'whatsapp', 'email', 'copy_link'
  });
};

export const trackFavorite = (
  action: 'add' | 'remove',
  propertyId: string,
  propertyTitle: string
) => {
  trackEvent('favorite_action', {
    action: action,
    property_id: propertyId,
    property_title: propertyTitle,
  });
};

export const trackAuth = (
  action: 'login' | 'logout' | 'signup' | 'password_reset',
  method?: string
) => {
  trackEvent('auth_action', {
    auth_action: action,
    auth_method: method || 'email',
  });
};

export const trackPropertyListInteraction = (
  interactionType: 'click' | 'view' | 'impression',
  propertyId: string,
  position: number
) => {
  trackEvent('property_list_interaction', {
    interaction_type: interactionType,
    property_id: propertyId,
    list_position: position,
  });
};