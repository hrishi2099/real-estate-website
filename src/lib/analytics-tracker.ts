import { prisma } from './prisma';

export interface TrackingData {
  userId?: string;
  propertyId?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class AnalyticsTracker {
  static async trackPropertyView(data: TrackingData) {
    try {
      if (!data.propertyId) {
        console.error('Property ID is required for view tracking');
        return;
      }

      await prisma.propertyAnalytics.create({
        data: {
          event: 'VIEW',
          propertyId: data.propertyId,
          userId: data.userId || null,
          userAgent: data.userAgent || null,
          ipAddress: data.ipAddress || null,
        }
      });

      // Update lead score if user is logged in
      if (data.userId) {
        await this.updateLeadScore(data.userId, 'PROPERTY_VIEW', {
          propertyId: data.propertyId,
          ...data.metadata
        });
      }
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }

  static async trackPropertyInquiry(data: TrackingData) {
    try {
      if (!data.propertyId) {
        console.error('Property ID is required for inquiry tracking');
        return;
      }

      await prisma.propertyAnalytics.create({
        data: {
          event: 'CONTACT',
          propertyId: data.propertyId,
          userId: data.userId || null,
          userAgent: data.userAgent || null,
          ipAddress: data.ipAddress || null,
        }
      });

      // Update lead score if user is logged in
      if (data.userId) {
        await this.updateLeadScore(data.userId, 'PROPERTY_INQUIRY', {
          propertyId: data.propertyId,
          ...data.metadata
        });
      }
    } catch (error) {
      console.error('Error tracking property inquiry:', error);
    }
  }

  static async trackPropertyFavorite(data: TrackingData) {
    try {
      if (!data.propertyId || !data.userId) {
        console.error('Property ID and User ID are required for favorite tracking');
        return;
      }

      await prisma.propertyAnalytics.create({
        data: {
          event: 'FAVORITE',
          propertyId: data.propertyId,
          userId: data.userId,
          userAgent: data.userAgent || null,
          ipAddress: data.ipAddress || null,
        }
      });

      // Update lead score
      await this.updateLeadScore(data.userId, 'FAVORITE_ADDED', {
        propertyId: data.propertyId,
        ...data.metadata
      });
    } catch (error) {
      console.error('Error tracking property favorite:', error);
    }
  }

  static async trackPropertyShare(data: TrackingData) {
    try {
      if (!data.propertyId) {
        console.error('Property ID is required for share tracking');
        return;
      }

      await prisma.propertyAnalytics.create({
        data: {
          event: 'SHARE',
          propertyId: data.propertyId,
          userId: data.userId || null,
          userAgent: data.userAgent || null,
          ipAddress: data.ipAddress || null,
        }
      });

      // Update lead score if user is logged in
      if (data.userId) {
        await this.updateLeadScore(data.userId, 'PROPERTY_VIEW', {
          propertyId: data.propertyId,
          shareAction: true,
          ...data.metadata
        });
      }
    } catch (error) {
      console.error('Error tracking property share:', error);
    }
  }

  static async updateLeadScore(userId: string, activityType: string, metadata: Record<string, any> = {}) {
    try {
      // Record the activity
      const scorePoints = this.getScoreForActivity(activityType);
      
      await prisma.leadActivity.create({
        data: {
          userId,
          activityType: activityType as any, // Type casting for enum
          propertyId: metadata.propertyId || null,
          metadata: JSON.stringify(metadata),
          score: scorePoints,
        }
      });

      // Update or create lead score
      const existingScore = await prisma.leadScore.findUnique({
        where: { userId }
      });

      if (existingScore) {
        const newScore = existingScore.score + scorePoints;
        const newGrade = this.calculateGrade(newScore);

        await prisma.leadScore.update({
          where: { userId },
          data: {
            score: newScore,
            grade: newGrade,
            lastActivity: new Date(),
            lastCalculated: new Date(),
            // Update specific counters
            ...(activityType === 'PROPERTY_VIEW' && { propertyViews: { increment: 1 } }),
            ...(activityType === 'PROPERTY_INQUIRY' && { inquiriesMade: { increment: 1 } }),
            ...(activityType === 'CONTACT_FORM' && { contactFormSubmissions: { increment: 1 } }),
            ...(activityType === 'FAVORITE_ADDED' && { favoritesSaved: { increment: 1 } }),
          }
        });
      } else {
        await prisma.leadScore.create({
          data: {
            userId,
            score: scorePoints,
            grade: this.calculateGrade(scorePoints),
            lastActivity: new Date(),
            // Initialize counters based on activity type
            propertyViews: activityType === 'PROPERTY_VIEW' ? 1 : 0,
            inquiriesMade: activityType === 'PROPERTY_INQUIRY' ? 1 : 0,
            contactFormSubmissions: activityType === 'CONTACT_FORM' ? 1 : 0,
            favoritesSaved: activityType === 'FAVORITE_ADDED' ? 1 : 0,
          }
        });
      }
    } catch (error) {
      console.error('Error updating lead score:', error);
    }
  }

  private static getScoreForActivity(activityType: string): number {
    const scoreMap: Record<string, number> = {
      'PROPERTY_VIEW': 2,
      'PROPERTY_INQUIRY': 15,
      'CONTACT_FORM': 20,
      'FAVORITE_ADDED': 5,
      'SEARCH_PERFORMED': 1,
      'RETURN_VISIT': 3,
      'PHONE_CALL_MADE': 25,
      'EMAIL_OPENED': 3,
      'BROCHURE_DOWNLOADED': 8,
    };
    
    return scoreMap[activityType] || 0;
  }

  private static calculateGrade(score: number): 'COLD' | 'WARM' | 'HOT' | 'QUALIFIED' {
    if (score >= 81) return 'QUALIFIED';
    if (score >= 61) return 'HOT';
    if (score >= 31) return 'WARM';
    return 'COLD';
  }

  static async getDashboardStats(userId: string) {
    try {
      const [favoritesCount, viewsCount, contactsCount] = await Promise.all([
        prisma.favorite.count({ where: { userId } }),
        prisma.propertyAnalytics.count({ 
          where: { userId, event: 'VIEW' } 
        }),
        prisma.inquiry.count({ where: { userId } })
      ]);

      return {
        savedProperties: favoritesCount,
        propertiesViewed: viewsCount,
        agentContacts: contactsCount
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        savedProperties: 0,
        propertiesViewed: 0,
        agentContacts: 0
      };
    }
  }

  static async getRecentActivity(userId: string, limit: number = 5) {
    try {
      const recentActivity = await prisma.propertyAnalytics.findMany({
        where: { userId },
        include: {
          property: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return recentActivity.map(activity => ({
        id: activity.id,
        action: this.getActionText(activity.event),
        property: activity.property.title,
        date: this.getRelativeTime(activity.createdAt),
        type: activity.event.toLowerCase()
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  private static getActionText(event: string): string {
    const actionMap: Record<string, string> = {
      'VIEW': 'Viewed property',
      'CONTACT': 'Contacted agent about',
      'FAVORITE': 'Saved property',
      'SHARE': 'Shared property'
    };
    
    return actionMap[event] || 'Unknown action';
  }

  private static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}