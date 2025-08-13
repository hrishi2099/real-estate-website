import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesManagerId = searchParams.get("salesManagerId");
    const timeframe = parseInt(searchParams.get("timeframe") || "30");

    if (!salesManagerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sales manager ID is required",
        },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Get lead assignments for this sales manager
    const assignments = await prisma.leadAssignment.findMany({
      where: {
        salesManagerId,
        assignedAt: {
          gte: startDate,
        },
      },
      include: {
        lead: {
          include: {
            leadScore: true,
          },
        },
      },
    });

    // Get pipeline stages for this sales manager
    const pipelineStages = await prisma.pipelineStage.findMany({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
      },
    });

    // Get activities for this sales manager
    const activities = await prisma.pipelineActivity.findMany({
      where: {
        stage: {
          assignment: {
            salesManagerId,
          },
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    
    const lastWeekActivities = await prisma.pipelineActivity.findMany({
      where: {
        stage: {
          assignment: {
            salesManagerId,
          },
        },
        createdAt: {
          gte: lastWeekDate,
        },
      },
    });

    // Calculate overview metrics
    const totalLeads = assignments.length;
    const activeLeads = pipelineStages.filter(stage => !stage.exitedAt).length;
    const wonDeals = pipelineStages.filter(stage => stage.stage === 'WON').length;
    const totalClosedDeals = pipelineStages.filter(stage => ['WON', 'LOST'].includes(stage.stage)).length;
    
    const totalRevenue = pipelineStages
      .filter(stage => stage.stage === 'WON' && stage.estimatedValue)
      .reduce((sum, stage) => sum + Number(stage.estimatedValue || 0), 0);
    
    const avgDealSize = wonDeals > 0 ? totalRevenue / wonDeals : 0;
    const winRate = totalClosedDeals > 0 ? (wonDeals / totalClosedDeals) * 100 : 0;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    // Calculate average sales cycle
    const completedDeals = pipelineStages.filter(stage => stage.exitedAt);
    const avgSalesCycle = completedDeals.length > 0 
      ? completedDeals.reduce((sum, stage) => sum + (stage.durationHours || 0), 0) / completedDeals.length / 24
      : 0;

    // Pipeline breakdown
    const pipelineByStage = pipelineStages
      .filter(stage => !stage.exitedAt)
      .reduce((acc, stage) => {
        if (!acc[stage.stage]) {
          acc[stage.stage] = { count: 0, value: 0, durations: [] };
        }
        acc[stage.stage].count++;
        acc[stage.stage].value += Number(stage.estimatedValue || 0);
        if (stage.durationHours) {
          acc[stage.stage].durations.push(stage.durationHours / 24);
        }
        return acc;
      }, {} as Record<string, { count: number; value: number; durations: number[] }>);

    const pipeline = Object.entries(pipelineByStage).reduce((acc, [stage, data]) => {
      acc[stage] = {
        count: data.count,
        value: data.value,
        avgDuration: data.durations.length > 0 
          ? Math.round(data.durations.reduce((sum, dur) => sum + dur, 0) / data.durations.length)
          : 0,
      };
      return acc;
    }, {} as Record<string, { count: number; value: number; avgDuration: number }>);

    // Activity breakdown
    const activityByType = activities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = 0;
      }
      acc[activity.activityType]++;
      return acc;
    }, {} as Record<string, number>);

    const lastWeekActivityByType = lastWeekActivities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = 0;
      }
      acc[activity.activityType]++;
      return acc;
    }, {} as Record<string, number>);

    const activitySummary = Object.entries(activityByType).map(([type, count]) => {
      const lastWeekCount = lastWeekActivityByType[type] || 0;
      const trend = lastWeekCount > count * 0.3 ? 'up' : 
                   lastWeekCount < count * 0.1 ? 'down' : 'stable';
      
      return {
        type,
        count,
        lastWeek: lastWeekCount,
        trend: trend as 'up' | 'down' | 'stable',
      };
    });

    // Mock monthly data for now (you could calculate this from real data)
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthly = [
      { 
        month: currentMonth, 
        leads: totalLeads, 
        deals: wonDeals, 
        revenue: totalRevenue, 
        activities: activities.length 
      },
    ];

    // Mock goals (these would typically be stored in a separate table)
    const goals = {
      monthlyRevenue: {
        target: 1000000,
        current: totalRevenue,
        progress: totalRevenue > 0 ? (totalRevenue / 1000000) * 100 : 0,
      },
      monthlyDeals: {
        target: 6,
        current: wonDeals,
        progress: wonDeals > 0 ? (wonDeals / 6) * 100 : 0,
      },
      quarterlyRevenue: {
        target: 3000000,
        current: totalRevenue,
        progress: totalRevenue > 0 ? (totalRevenue / 3000000) * 100 : 0,
      },
    };

    const performanceData = {
      overview: {
        totalLeads,
        activeLeads,
        closedDeals: totalClosedDeals,
        revenue: totalRevenue,
        winRate: Math.round(winRate * 100) / 100,
        avgDealSize: Math.round(avgDealSize),
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgSalesCycle: Math.round(avgSalesCycle),
      },
      monthly,
      pipeline,
      activities: activitySummary,
      goals,
    };

    return NextResponse.json({
      success: true,
      data: performanceData,
    });

  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance metrics",
      },
      { status: 500 }
    );
  }
}