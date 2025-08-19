import { prisma } from '@/lib/prisma';
import { getRelativeTime } from '@/lib/utils';

type LeadActivityType =
  | 'PROPERTY_VIEW'
  | 'PROPERTY_INQUIRY'
  | 'CONTACT_FORM'
  | 'FAVORITE_ADDED'
  | 'SEARCH_PERFORMED'
  | 'RETURN_VISIT'
  | 'PHONE_CALL_MADE'
  | 'EMAIL_OPENED'
  | 'BROCHURE_DOWNLOADED';

export class AnalyticsService {
  static async getDashboardStats(userId: string) {
    try {
      const [savedProperties, propertiesViewed, agentContacts] =
        await Promise.all([
          prisma.favorite.count({ where: { userId } }),
          prisma.propertyAnalytics.count({ where: { userId, event: 'VIEW' } }),
          prisma.inquiry.count({ where: { userId } }),
        ]);
      return { savedProperties, propertiesViewed, agentContacts };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return { savedProperties: 0, propertiesViewed: 0, agentContacts: 0 };
    }
  }

  static async getRecentActivity(userId: string, take: number = 5) {
    try {
      const activities = await prisma.propertyAnalytics.findMany({
        where: { userId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take,
      });

      return activities.map((activity) => ({
        id: activity.id,
        action: this.getActionText(activity.event),
        property: activity.property.title,
        date: getRelativeTime(activity.createdAt),
        type: activity.event.toLowerCase(),
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  static getActionText(event: string): string {
    const actionMap: Record<string, string> = {
      VIEW: 'Viewed property',
      CONTACT: 'Contacted agent about',
      FAVORITE: 'Saved property',
      SHARE: 'Shared property',
    };
    return actionMap[event] || 'Unknown action';
  }

  static getScoreForActivity(activityType: LeadActivityType): number {
    const scores: Record<LeadActivityType, number> = {
      PROPERTY_VIEW: 2,
      PROPERTY_INQUIRY: 15,
      CONTACT_FORM: 20,
      FAVORITE_ADDED: 5,
      SEARCH_PERFORMED: 1,
      RETURN_VISIT: 3,
      PHONE_CALL_MADE: 25,
      EMAIL_OPENED: 3,
      BROCHURE_DOWNLOADED: 8,
    };
    return scores[activityType] || 0;
  }

  static calculateGrade(
    score: number
  ): 'QUALIFIED' | 'HOT' | 'WARM' | 'COLD' {
    if (score >= 81) return 'QUALIFIED';
    if (score >= 61) return 'HOT';
    if (score >= 31) return 'WARM';
    return 'COLD';
  }
}