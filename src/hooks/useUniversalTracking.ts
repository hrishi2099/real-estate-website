"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackPageView,
  trackScrollDepth,
  trackTimeOnPage,
  trackButtonClick,
  trackError,
  trackPerformance,
  trackFormInteraction
} from '@/lib/analytics-gtm';

export function useUniversalTracking() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Reset start time when pathname changes
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    scrollDepthRef.current = 0;

    // Track page view
    const pageTitle = document.title;
    trackPageView(pathname, pageTitle);

    // Track initial page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 0) {
        trackPerformance('page_load_time', loadTime, pathname);
      }
    }

  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Scroll depth tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

      // Track scroll milestones (25%, 50%, 75%, 100%)
      const currentDepth = Math.floor(scrollPercent / 25) * 25;
      if (currentDepth > scrollDepthRef.current && currentDepth > 0) {
        scrollDepthRef.current = currentDepth;
        trackScrollDepth(scrollTop, documentHeight + window.innerHeight);
      }

      // Track max scroll for time on page calculation
      if (scrollTop > maxScrollRef.current) {
        maxScrollRef.current = scrollTop;
      }
    };

    // Click tracking for buttons and links
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      const isButton = tagName === 'button' || (tagName === 'input' && (target as HTMLInputElement).type === 'button');
      const isLink = tagName === 'a';
      
      if (isButton || isLink) {
        const text = target.textContent?.trim() || target.getAttribute('aria-label') || target.getAttribute('title') || '';
        const href = isLink ? (target as HTMLAnchorElement).href : '';
        const buttonType = isButton ? target.getAttribute('type') || 'button' : 'link';
        const context = target.closest('[data-section]')?.getAttribute('data-section') || 
                       target.closest('nav')?.getAttribute('class') || 
                       target.closest('header')?.getAttribute('class') || 
                       target.closest('footer')?.getAttribute('class') || 
                       'unknown';

        trackButtonClick(text, buttonType, context);
      }
    };

    // Form interaction tracking
    const handleFormFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        const form = target.closest('form');
        const formName = form?.getAttribute('name') || form?.getAttribute('id') || 'unnamed_form';
        const fieldName = target.getAttribute('name') || target.getAttribute('id') || target.tagName.toLowerCase();
        
        // Import trackFormInteraction dynamically to avoid circular imports
        import('@/lib/analytics-gtm').then(({ trackFormInteraction }) => {
          trackFormInteraction(formName, fieldName, 'focus');
        });
      }
    };

    // Error tracking
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error', event.message, event.filename || pathname);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('promise_rejection', String(event.reason), pathname);
    };

    // Visibility change tracking (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Track time spent when user leaves page
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 5) { // Only track if more than 5 seconds
          trackTimeOnPage(timeSpent, pathname);
        }
      } else {
        // Reset timer when user returns
        startTimeRef.current = Date.now();
      }
    };

    // Performance observer for Web Vitals
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            trackPerformance('lcp', entry.startTime, pathname);
          } else if (entry.entryType === 'first-input') {
            trackPerformance('fid', (entry as any).processingStart - entry.startTime, pathname);
          } else if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            trackPerformance('cls', (entry as any).value, pathname);
          }
        });
      });

      try {
        performanceObserverRef.current.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        // Silently handle if not supported
      }
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('focus', handleFormFocus, true);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Track final time on page
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) {
        trackTimeOnPage(timeSpent, pathname);
      }

      // Remove event listeners
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('focus', handleFormFocus, true);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Disconnect performance observer
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, [pathname]);
}

// Hook for tracking component-specific interactions
export function useComponentTracking(componentName: string) {
  return {
    trackInteraction: (action: string, details?: Record<string, any>) => {
      import('@/lib/analytics-gtm').then(({ trackEvent }) => {
        trackEvent('component_interaction', {
          component_name: componentName,
          action: action,
          ...details
        });
      });
    }
  };
}