// Ensure dataLayer is initialized
declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

export const trackContactSubmission = (context: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'contact_form_submission',
      form_context: context,
      // Add any other relevant data here
    });
  }
};

export const trackButtonClick = (text: string, type: string, context: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'button_click',
      button_text: text,
      button_type: type,
      button_context: context,
    });
  }
};

export const trackScrollDepth = (scrollTop: number, documentHeight: number) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'scroll_depth',
      scroll_top: scrollTop,
      document_height: documentHeight,
    });
  }
};

export const trackTimeOnPage = (timeSpent: number, pagePath: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'time_on_page',
      time_spent_seconds: timeSpent,
      page_path: pagePath,
    });
  }
};

// You can add more tracking functions here (e.g., for page views, errors, etc.)
// For page views, GTM often handles this automatically, but you can push custom page view events if needed.
export const trackPageView = (pathname: string, title: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_title: title,
    });
  }
};

// Example for tracking authentication events
export const trackAuth = (action: 'login' | 'logout', method?: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: `user_${action}`,
      auth_method: method,
    });
  }
};

// Example for tracking errors
export const trackError = (errorType: string, errorMessage: string, errorContext: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'app_error',
      error_type: errorType,
      error_message: errorMessage,
      error_context: errorContext,
    });
  }
};

// Example for tracking performance metrics
export const trackPerformance = (metricName: string, value: number, pagePath: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'performance_metric',
      metric_name: metricName,
      metric_value: value,
      page_path: pagePath,
    });
  }
};

// Example for tracking form interactions
export const trackFormInteraction = (formName: string, fieldName: string, interactionType: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'form_interaction',
      form_name: formName,
      field_name: fieldName,
      interaction_type: interactionType,
    });
  }
};

export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  }
};