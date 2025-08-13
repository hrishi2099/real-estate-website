"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface OfficeSettings {
  gtmContainerId?: string | null;
  gtmEnabled?: boolean | null;
  ga4MeasurementId?: string | null;
  ga4Enabled?: boolean | null;
  facebookPixelId?: string | null;
  facebookPixelEnabled?: boolean | null;
}

interface AnalyticsProps {
  settings?: OfficeSettings;
}

// Track events using GTM dataLayer or direct GA4
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  try {
    // Add timestamp and session info
    const enrichedParameters = {
      ...parameters,
      timestamp: new Date().toISOString(),
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof window !== 'undefined' ? document.title : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      viewport_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    };

    // GTM dataLayer event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...enrichedParameters
      });
    }

    // Direct GA4 event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, enrichedParameters);
    }

    // Facebook Pixel event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const fbEventName = eventName === 'page_view' ? 'PageView' : 
                         eventName === 'purchase' ? 'Purchase' :
                         eventName === 'lead' ? 'Lead' : 
                         eventName === 'search' ? 'Search' :
                         eventName === 'view_content' ? 'ViewContent' : 'CustomEvent';
      
      if (fbEventName === 'CustomEvent') {
        (window as any).fbq('trackCustom', eventName, enrichedParameters);
      } else {
        (window as any).fbq('track', fbEventName, enrichedParameters);
      }
    }

    // Console log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Analytics Event:', eventName, enrichedParameters);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track property views
export const trackPropertyView = (propertyId: string, propertyTitle: string, price: number) => {
  trackEvent('property_view', {
    property_id: propertyId,
    property_title: propertyTitle,
    value: price,
    currency: 'INR'
  });
};

// Track property inquiries
export const trackPropertyInquiry = (propertyId: string, propertyTitle: string, inquiryType: string) => {
  trackEvent('property_inquiry', {
    property_id: propertyId,
    property_title: propertyTitle,
    inquiry_type: inquiryType
  });
};

// Track contact form submissions
export const trackContactSubmission = (source: string) => {
  trackEvent('contact_form_submit', {
    form_source: source
  });
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    referrer: typeof window !== 'undefined' ? document.referrer : ''
  });
};

// Track navigation clicks
export const trackNavigation = (linkText: string, destination: string, section: string) => {
  trackEvent('navigation_click', {
    link_text: linkText,
    link_destination: destination,
    nav_section: section
  });
};

// Track search interactions
export const trackSearch = (searchTerm: string, filters: Record<string, any> = {}, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    search_filters: JSON.stringify(filters),
    results_count: resultsCount,
    search_type: 'property_search'
  });
};

// Track filter usage
export const trackFilterUsage = (filterType: string, filterValue: any, activeFilters: Record<string, any>) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: String(filterValue),
    all_active_filters: JSON.stringify(activeFilters),
    total_active_filters: Object.keys(activeFilters).length
  });
};

// Track button/CTA clicks
export const trackButtonClick = (buttonText: string, buttonType: string, context?: string) => {
  trackEvent('button_click', {
    button_text: buttonText,
    button_type: buttonType,
    button_context: context || 'unknown',
    click_position: typeof window !== 'undefined' ? `${window.scrollY}px_from_top` : ''
  });
};

// Track file downloads
export const trackDownload = (fileName: string, fileType: string, downloadSource: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    download_source: downloadSource
  });
};

// Track user engagement (scroll depth)
export const trackScrollDepth = (depth: number, maxDepth: number) => {
  trackEvent('scroll_depth', {
    scroll_depth_percentage: Math.round((depth / maxDepth) * 100),
    scroll_depth_pixels: depth,
    page_height: maxDepth
  });
};

// Track time on page
export const trackTimeOnPage = (timeSpent: number, pageUrl: string) => {
  trackEvent('time_on_page', {
    time_spent_seconds: timeSpent,
    time_spent_minutes: Math.round(timeSpent / 60),
    page_url: pageUrl
  });
};

// Track form interactions
export const trackFormInteraction = (formName: string, fieldName: string, interactionType: 'focus' | 'blur' | 'change') => {
  trackEvent('form_interaction', {
    form_name: formName,
    field_name: fieldName,
    interaction_type: interactionType
  });
};

// Track errors
export const trackError = (errorType: string, errorMessage: string, errorSource?: string, errorObj?: Error) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    error_source: errorSource || 'unknown',
    error_stack: errorObj?.stack || ''
  });
};

// Track property list interactions
export const trackPropertyListInteraction = (action: string, propertyId: string, position: number) => {
  trackEvent('property_list_interaction', {
    action: action, // 'click', 'favorite', 'share', 'view_images'
    property_id: propertyId,
    list_position: position
  });
};

// Track image gallery interactions
export const trackImageGallery = (propertyId: string, action: string, imageIndex?: number) => {
  trackEvent('image_gallery_interaction', {
    property_id: propertyId,
    action: action, // 'open', 'close', 'next', 'previous', 'thumbnail_click'
    image_index: imageIndex || 0
  });
};

// Track sharing actions
export const trackShare = (contentType: string, contentId: string, shareMethod: string) => {
  trackEvent('content_share', {
    content_type: contentType, // 'property', 'page', 'listing'
    content_id: contentId,
    share_method: shareMethod // 'facebook', 'twitter', 'whatsapp', 'email', 'copy_link'
  });
};

// Track favorites/wishlist actions
export const trackFavorite = (action: 'add' | 'remove', propertyId: string, propertyTitle: string) => {
  trackEvent('favorite_action', {
    action: action,
    property_id: propertyId,
    property_title: propertyTitle
  });
};

// Track user authentication events
export const trackAuth = (action: 'login' | 'logout' | 'signup' | 'password_reset', method?: string) => {
  trackEvent('auth_action', {
    auth_action: action,
    auth_method: method || 'email'
  });
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, context?: string) => {
  trackEvent('performance_metric', {
    metric_name: metric,
    metric_value: value,
    metric_context: context || 'general'
  });
};

export default function Analytics({ settings }: AnalyticsProps) {
  const [analyticsSettings, setAnalyticsSettings] = useState<OfficeSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setAnalyticsSettings(settings);
    } else {
      // Fetch settings if not provided
      fetch('/api/admin/settings')
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        })
        .then(data => setAnalyticsSettings(data))
        .catch(err => {
          console.error('Failed to load analytics settings:', err);
          // Set empty settings to prevent infinite loading
          setAnalyticsSettings({});
        });
    }
  }, [settings]);

  if (!analyticsSettings) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {analyticsSettings.gtmEnabled && analyticsSettings.gtmContainerId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${analyticsSettings.gtmContainerId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analyticsSettings.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (Direct) */}
      {analyticsSettings.ga4Enabled && analyticsSettings.ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsSettings.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsSettings.ga4MeasurementId}', {
                  page_title: document.title,
                  page_location: window.location.href
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {analyticsSettings.facebookPixelEnabled && analyticsSettings.facebookPixelId && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${analyticsSettings.facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${analyticsSettings.facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}