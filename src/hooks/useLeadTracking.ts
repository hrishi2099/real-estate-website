import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export function useLeadTracking() {
  const { user } = useAuth();

  const trackActivity = async (
    activityType: string,
    propertyId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await api.trackLeadActivity({
        userId: user.id,
        activityType,
        propertyId,
        metadata,
      });
    } catch (error) {
      console.error('Failed to track lead activity:', error);
    }
  };

  const trackPropertyView = (propertyId: string, propertyTitle?: string) => {
    trackActivity('PROPERTY_VIEW', propertyId, { propertyTitle });
  };

  const trackPropertyInquiry = (propertyId: string, message?: string) => {
    trackActivity('PROPERTY_INQUIRY', propertyId, { message });
  };

  const trackContactForm = (subject?: string, message?: string) => {
    trackActivity('CONTACT_FORM', undefined, { subject, message });
  };

  const trackFavoriteAdded = (propertyId: string, propertyTitle?: string) => {
    trackActivity('FAVORITE_ADDED', propertyId, { propertyTitle });
  };

  const trackSearch = (searchParams: Record<string, any>) => {
    trackActivity('SEARCH_PERFORMED', undefined, searchParams);
  };

  const trackReturnVisit = () => {
    trackActivity('RETURN_VISIT');
  };

  return {
    trackPropertyView,
    trackPropertyInquiry,
    trackContactForm,
    trackFavoriteAdded,
    trackSearch,
    trackReturnVisit,
    trackActivity,
  };
}