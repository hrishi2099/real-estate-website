import { prisma } from "@/lib/prisma";
import { LeadGrade, LeadActivityType } from "@prisma/client";

export interface LeadScoringConfig {
  weights: {
    propertyViews: number;
    inquiriesMade: number;
    contactFormSubmissions: number;
    favoritesSaved: number;
    returnVisits: number;
    avgSessionDuration: number;
    daysActive: number;
    budgetMatch: number;
    recentActivity: number;
  };
  thresholds: {
    cold: number;
    warm: number;
    hot: number;
    qualified: number;
  };
}

export const defaultScoringConfig: LeadScoringConfig = {
  weights: {
    propertyViews: 2,          // 2 points per view
    inquiriesMade: 15,         // 15 points per inquiry
    contactFormSubmissions: 20, // 20 points per contact form
    favoritesSaved: 5,         // 5 points per favorite
    returnVisits: 8,           // 8 points per return visit
    avgSessionDuration: 0.5,   // 0.5 points per minute
    daysActive: 1,             // 1 point per active day
    budgetMatch: 10,           // 10 points if budget matches property prices
    recentActivity: 15,        // 15 bonus points for activity in last 7 days
  },
  thresholds: {
    cold: 30,
    warm: 60,
    hot: 80,
    qualified: 100,
  },
};

export class LeadScoringEngine {
  private config: LeadScoringConfig;

  constructor(config: LeadScoringConfig = defaultScoringConfig) {
    this.config = config;
  }

  async calculateUserScore(userId: string): Promise<{
    score: number;
    grade: LeadGrade;
    breakdown: Record<string, number>;
  }> {
    // Get user data with related information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        inquiries: {
          orderBy: { createdAt: "desc" },
        },
        favorites: true,
        analytics: {
          where: {
            event: "VIEW",
          },
          orderBy: { createdAt: "desc" },
        },
        leadScore: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const breakdown: Record<string, number> = {};
    let totalScore = 0;

    // Property views score
    const propertyViewsScore = Math.min(user.analytics.length * this.config.weights.propertyViews, 50);
    breakdown.propertyViews = propertyViewsScore;
    totalScore += propertyViewsScore;

    // Inquiries made score
    const inquiriesScore = user.inquiries.length * this.config.weights.inquiriesMade;
    breakdown.inquiries = inquiriesScore;
    totalScore += inquiriesScore;

    // Get contact form submissions
    const contactSubmissions = await prisma.contactInquiry.count({
      where: { email: user.email },
    });
    const contactScore = contactSubmissions * this.config.weights.contactFormSubmissions;
    breakdown.contactForms = contactScore;
    totalScore += contactScore;

    // Favorites saved score
    const favoritesScore = user.favorites.length * this.config.weights.favoritesSaved;
    breakdown.favorites = favoritesScore;
    totalScore += favoritesScore;

    // Calculate return visits (unique days with analytics events)
    const uniqueDays = new Set(
      user.analytics.map(a => a.createdAt.toDateString())
    ).size;
    const returnVisitsScore = Math.max(0, (uniqueDays - 1) * this.config.weights.returnVisits);
    breakdown.returnVisits = returnVisitsScore;
    totalScore += returnVisitsScore;

    // Calculate session duration (approximate from analytics)
    const avgSessionScore = await this.calculateSessionScore(userId);
    breakdown.sessionDuration = avgSessionScore;
    totalScore += avgSessionScore;

    // Days active score
    const daysActiveScore = await this.calculateDaysActiveScore(userId);
    breakdown.daysActive = daysActiveScore;
    totalScore += daysActiveScore;

    // Budget match score
    const budgetScore = await this.calculateBudgetMatchScore(userId);
    breakdown.budgetMatch = budgetScore;
    totalScore += budgetScore;

    // Recent activity bonus
    const recentActivityScore = await this.calculateRecentActivityScore(userId);
    breakdown.recentActivity = recentActivityScore;
    totalScore += recentActivityScore;

    // Cap total score at 100
    totalScore = Math.min(totalScore, 100);

    const grade = this.determineGrade(totalScore);

    return {
      score: Math.round(totalScore),
      grade,
      breakdown,
    };
  }

  private async calculateSessionScore(userId: string): Promise<number> {
    const analytics = await prisma.propertyAnalytics.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10, // Last 10 sessions
    });

    if (analytics.length === 0) return 0;

    // Estimate session duration based on time between events
    let totalMinutes = 0;
    let sessionCount = 0;

    for (let i = 0; i < analytics.length - 1; i++) {
      const timeDiff = analytics[i].createdAt.getTime() - analytics[i + 1].createdAt.getTime();
      const minutes = timeDiff / (1000 * 60);
      
      // Consider as same session if within 30 minutes
      if (minutes <= 30) {
        totalMinutes += minutes;
        sessionCount++;
      }
    }

    if (sessionCount === 0) return 5; // Default score for single visits

    const avgMinutes = totalMinutes / sessionCount;
    return Math.min(avgMinutes * this.config.weights.avgSessionDuration, 20);
  }

  private async calculateDaysActiveScore(userId: string): Promise<number> {
    const firstActivity = await prisma.propertyAnalytics.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const lastActivity = await prisma.propertyAnalytics.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!firstActivity || !lastActivity) return 0;

    const daysDiff = Math.ceil(
      (lastActivity.createdAt.getTime() - firstActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(daysDiff * this.config.weights.daysActive, 30);
  }

  private async calculateBudgetMatchScore(userId: string): Promise<number> {
    const userInquiries = await prisma.inquiry.findMany({
      where: { userId },
      include: { property: true },
    });

    const viewedProperties = await prisma.propertyAnalytics.findMany({
      where: { userId },
      include: { property: true },
    });

    const allProperties = [
      ...userInquiries.map(i => i.property),
      ...viewedProperties.map(v => v.property),
    ].filter(p => p);

    if (allProperties.length === 0) return 0;

    // Calculate average price range of viewed/inquired properties
    const prices = allProperties.map(p => parseFloat(p.price.toString()));
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = Math.max(...prices) - Math.min(...prices);

    // If user consistently looks at properties in similar price range, they likely have a budget
    const priceConsistency = priceRange < avgPrice * 0.5 ? 1 : 0.5;
    
    return this.config.weights.budgetMatch * priceConsistency;
  }

  private async calculateRecentActivityScore(userId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.propertyAnalytics.count({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const recentInquiries = await prisma.inquiry.count({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return (recentActivity > 0 || recentInquiries > 0) ? this.config.weights.recentActivity : 0;
  }

  private determineGrade(score: number): LeadGrade {
    if (score >= this.config.thresholds.qualified) return LeadGrade.QUALIFIED;
    if (score >= this.config.thresholds.hot) return LeadGrade.HOT;
    if (score >= this.config.thresholds.warm) return LeadGrade.WARM;
    return LeadGrade.COLD;
  }

  async updateUserScore(userId: string): Promise<void> {
    const { score, grade, breakdown } = await this.calculateUserScore(userId);

    // Get additional metrics
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        inquiries: true,
        favorites: true,
        analytics: true,
      },
    });

    if (!user) return;

    const uniqueDays = new Set(
      user.analytics.map(a => a.createdAt.toDateString())
    ).size;

    const contactSubmissions = await prisma.contactInquiry.count({
      where: { email: user.email },
    });

    // Estimate budget from viewed properties
    const viewedProperties = await prisma.propertyAnalytics.findMany({
      where: { userId },
      include: { property: true },
    });

    let budgetEstimate = null;
    if (viewedProperties.length > 0) {
      const prices = viewedProperties.map(v => parseFloat(v.property.price.toString()));
      budgetEstimate = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    // Determine if user is a serious buyer
    const seriousBuyerIndicator = score >= this.config.thresholds.warm && 
                                 (user.inquiries.length > 0 || contactSubmissions > 0);

    await prisma.leadScore.upsert({
      where: { userId },
      update: {
        score,
        grade,
        propertyViews: user.analytics.length,
        inquiriesMade: user.inquiries.length,
        contactFormSubmissions: contactSubmissions,
        favoritesSaved: user.favorites.length,
        returnVisits: Math.max(0, uniqueDays - 1),
        daysActive: uniqueDays,
        budgetEstimate,
        seriousBuyerIndicator,
        lastActivity: user.analytics[0]?.createdAt,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        score,
        grade,
        propertyViews: user.analytics.length,
        inquiriesMade: user.inquiries.length,
        contactFormSubmissions: contactSubmissions,
        favoritesSaved: user.favorites.length,
        returnVisits: Math.max(0, uniqueDays - 1),
        daysActive: uniqueDays,
        budgetEstimate,
        seriousBuyerIndicator,
        lastActivity: user.analytics[0]?.createdAt,
        lastCalculated: new Date(),
      },
    });
  }

  async trackActivity(
    userId: string,
    activityType: LeadActivityType,
    propertyId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activityScores = {
      PROPERTY_VIEW: 2,
      PROPERTY_INQUIRY: 15,
      CONTACT_FORM: 20,
      FAVORITE_ADDED: 5,
      SEARCH_PERFORMED: 1,
      RETURN_VISIT: 8,
      PHONE_CALL_MADE: 25,
      EMAIL_OPENED: 3,
      BROCHURE_DOWNLOADED: 10,
    };

    await prisma.leadActivity.create({
      data: {
        userId,
        activityType,
        propertyId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        score: activityScores[activityType] || 0,
      },
    });

    // Update lead score after tracking activity
    await this.updateUserScore(userId);
  }

  async getLeadScores(options?: {
    grade?: LeadGrade;
    minScore?: number;
    maxScore?: number;
    limit?: number;
  }): Promise<Array<{
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    leadScore: {
      score: number;
      grade: LeadGrade;
      lastActivity?: Date;
      seriousBuyerIndicator: boolean;
      budgetEstimate?: number;
    };
  }>> {
    const where: any = {};

    if (options?.grade) {
      where.grade = options.grade;
    }

    if (options?.minScore || options?.maxScore) {
      where.score = {};
      if (options.minScore) where.score.gte = options.minScore;
      if (options.maxScore) where.score.lte = options.maxScore;
    }

    const leadScores = await prisma.leadScore.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
      take: options?.limit,
    });

    return leadScores.map(ls => ({
      user: {
        ...ls.user,
        phone: ls.user.phone || undefined,
      },
      leadScore: {
        score: ls.score,
        grade: ls.grade,
        lastActivity: ls.lastActivity || undefined,
        seriousBuyerIndicator: ls.seriousBuyerIndicator,
        budgetEstimate: ls.budgetEstimate ? parseFloat(ls.budgetEstimate.toString()) : undefined,
      },
    }));
  }
}

export const leadScoringEngine = new LeadScoringEngine();