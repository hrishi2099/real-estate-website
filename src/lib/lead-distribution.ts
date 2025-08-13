import { prisma } from "@/lib/prisma";

export interface DistributionRule {
  type: 'round_robin' | 'load_balanced' | 'score_based' | 'territory_based' | 'performance_based' | 'availability_based';
  maxLeadsPerManager?: number;
  minLeadScore?: number;
  territoryMapping?: Record<string, string[]>; // territory -> salesManagerIds
  prioritizeHighScorers?: boolean;
  respectWorkingHours?: boolean;
}

export interface SalesManagerWithStats {
  id: string;
  name: string;
  email: string;
  territory?: string;
  commission?: number;
  status: string;
  currentLoad: number;
  totalAssignments: number;
  completedDeals: number;
  averageCloseTime?: number; // in days
  successRate?: number; // percentage
  lastAssignmentDate?: Date;
  workingHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface LeadWithScore {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: Date;
  leadScore: {
    score: number;
    grade: string;
    seriousBuyerIndicator: boolean;
    budgetEstimate?: number;
    locationSearches?: string[];
    propertyTypeInterests?: string[];
    lastActivity?: Date;
  };
}

export class LeadDistributionEngine {
  
  /**
   * Get available sales managers with their statistics
   */
  async getAvailableSalesManagers(excludeIds: string[] = []): Promise<SalesManagerWithStats[]> {
    const salesManagers = await prisma.user.findMany({
      where: {
        role: "SALES_MANAGER",
        status: "ACTIVE",
        id: { notIn: excludeIds },
      },
      include: {
        assignedLeads: {
          where: {
            status: "ACTIVE",
          },
        },
        _count: {
          select: {
            assignedLeads: {
              where: { status: "ACTIVE" }
            }
          }
        }
      },
    });

    // Calculate performance metrics for each sales manager
    const managersWithStats: SalesManagerWithStats[] = [];

    for (const manager of salesManagers) {
      // Get completed assignments for performance calculation
      const completedAssignments = await prisma.leadAssignment.findMany({
        where: {
          salesManagerId: manager.id,
          status: "COMPLETED",
        },
        include: {
          lead: {
            include: {
              leadScore: true,
            }
          }
        },
        orderBy: { assignedAt: "desc" },
        take: 50, // Last 50 for performance calculation
      });

      const totalAssignments = await prisma.leadAssignment.count({
        where: { salesManagerId: manager.id },
      });

      // Calculate average close time and success rate
      let averageCloseTime = undefined;
      let successRate = 0;

      if (completedAssignments.length > 0) {
        const closeTimes = completedAssignments.map(assignment => {
          const assignedDate = new Date(assignment.assignedAt);
          const completedDate = new Date(); // Assuming completed recently
          return Math.ceil((completedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
        });

        averageCloseTime = closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length;
        successRate = totalAssignments > 0 ? (completedAssignments.length / totalAssignments) * 100 : 0;
      }

      managersWithStats.push({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        territory: manager.territory || undefined,
        commission: manager.commission ? parseFloat(manager.commission.toString()) : undefined,
        status: manager.status,
        currentLoad: manager._count.assignedLeads,
        totalAssignments,
        completedDeals: completedAssignments.length,
        averageCloseTime,
        successRate,
        lastAssignmentDate: manager.assignedLeads[0]?.assignedAt,
      });
    }

    return managersWithStats;
  }

  /**
   * Get unassigned leads with their scores
   */
  async getUnassignedLeads(filters?: {
    minScore?: number;
    grade?: string;
    seriousBuyersOnly?: boolean;
    limit?: number;
  }): Promise<LeadWithScore[]> {
    const whereClause: any = {
      role: "USER",
      status: "ACTIVE",
      leadScore: { isNot: null },
      leadAssignments: {
        none: { status: "ACTIVE" }
      },
    };

    if (filters?.minScore) {
      whereClause.leadScore.score = { gte: filters.minScore };
    }

    if (filters?.grade) {
      whereClause.leadScore.grade = filters.grade;
    }

    if (filters?.seriousBuyersOnly) {
      whereClause.leadScore.seriousBuyerIndicator = true;
    }

    const leads = await prisma.user.findMany({
      where: whereClause,
      include: {
        leadScore: true,
      },
      orderBy: [
        { leadScore: { score: "desc" } },
        { leadScore: { lastCalculated: "desc" } },
      ],
      take: filters?.limit || 100,
    });

    return leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || undefined,
      joinDate: lead.joinDate,
      leadScore: {
        score: lead.leadScore?.score || 0,
        grade: lead.leadScore?.grade || 'COLD',
        seriousBuyerIndicator: lead.leadScore?.seriousBuyerIndicator || false,
        budgetEstimate: lead.leadScore?.budgetEstimate ? 
          parseFloat(lead.leadScore.budgetEstimate.toString()) : undefined,
        locationSearches: lead.leadScore?.locationSearches ? 
          JSON.parse(lead.leadScore.locationSearches) : undefined,
        propertyTypeInterests: lead.leadScore?.propertyTypeInterests ? 
          JSON.parse(lead.leadScore.propertyTypeInterests) : undefined,
        lastActivity: lead.leadScore?.lastActivity || undefined,
      },
    }));
  }

  /**
   * Distribute leads using Round Robin algorithm
   */
  distributeRoundRobin(
    leads: LeadWithScore[], 
    salesManagers: SalesManagerWithStats[],
    maxLeadsPerManager?: number
  ): Array<{ leadId: string; salesManagerId: string; reason: string }> {
    const assignments: Array<{ leadId: string; salesManagerId: string; reason: string }> = [];
    let currentIndex = 0;

    for (const lead of leads) {
      // Filter managers who haven't reached max capacity
      const availableManagers = maxLeadsPerManager ? 
        salesManagers.filter(manager => manager.currentLoad < maxLeadsPerManager) :
        salesManagers;

      if (availableManagers.length === 0) break;

      const selectedManager = availableManagers[currentIndex % availableManagers.length];
      
      assignments.push({
        leadId: lead.id,
        salesManagerId: selectedManager.id,
        reason: `Round robin assignment (position ${currentIndex + 1})`
      });

      // Update current load for next iteration
      selectedManager.currentLoad++;
      currentIndex++;
    }

    return assignments;
  }

  /**
   * Distribute leads using Load Balanced algorithm
   */
  distributeLoadBalanced(
    leads: LeadWithScore[], 
    salesManagers: SalesManagerWithStats[],
    maxLeadsPerManager?: number
  ): Array<{ leadId: string; salesManagerId: string; reason: string }> {
    const assignments: Array<{ leadId: string; salesManagerId: string; reason: string }> = [];
    
    // Create a working copy of managers
    const workingManagers = [...salesManagers];

    for (const lead of leads) {
      // Filter managers who haven't reached max capacity
      const availableManagers = maxLeadsPerManager ? 
        workingManagers.filter(manager => manager.currentLoad < maxLeadsPerManager) :
        workingManagers;

      if (availableManagers.length === 0) break;

      // Sort by current load (ascending) to always pick the least loaded
      availableManagers.sort((a, b) => a.currentLoad - b.currentLoad);
      const selectedManager = availableManagers[0];

      assignments.push({
        leadId: lead.id,
        salesManagerId: selectedManager.id,
        reason: `Load balanced assignment (current load: ${selectedManager.currentLoad})`
      });

      // Update current load
      selectedManager.currentLoad++;
    }

    return assignments;
  }

  /**
   * Distribute leads using Score-Based algorithm (high-performing managers get high-score leads)
   */
  distributeScoreBased(
    leads: LeadWithScore[], 
    salesManagers: SalesManagerWithStats[],
    maxLeadsPerManager?: number
  ): Array<{ leadId: string; salesManagerId: string; reason: string }> {
    const assignments: Array<{ leadId: string; salesManagerId: string; reason: string }> = [];
    
    // Sort managers by performance (success rate desc, then by avg close time asc)
    const performanceRankedManagers = [...salesManagers].sort((a, b) => {
      if (a.successRate !== b.successRate) {
        return (b.successRate || 0) - (a.successRate || 0);
      }
      return (a.averageCloseTime || 999) - (b.averageCloseTime || 999);
    });

    // Sort leads by score (desc) so high-value leads go first
    const sortedLeads = [...leads].sort((a, b) => b.leadScore.score - a.leadScore.score);

    let managerIndex = 0;
    const workingManagers = [...performanceRankedManagers];

    for (const lead of sortedLeads) {
      // Filter managers who haven't reached max capacity
      const availableManagers = maxLeadsPerManager ? 
        workingManagers.filter(manager => manager.currentLoad < maxLeadsPerManager) :
        workingManagers;

      if (availableManagers.length === 0) break;

      // For high-score leads (>= 70), prioritize top performers
      // For medium-score leads (40-69), distribute evenly
      // For low-score leads (<40), use round-robin among all
      let selectedManager: SalesManagerWithStats;

      if (lead.leadScore.score >= 70) {
        // High-value lead: assign to top performer with capacity
        selectedManager = availableManagers.find(manager => manager.successRate && manager.successRate > 20) || availableManagers[0];
      } else if (lead.leadScore.score >= 40) {
        // Medium-value lead: balanced distribution
        availableManagers.sort((a, b) => a.currentLoad - b.currentLoad);
        selectedManager = availableManagers[0];
      } else {
        // Low-value lead: round-robin
        selectedManager = availableManagers[managerIndex % availableManagers.length];
        managerIndex++;
      }

      assignments.push({
        leadId: lead.id,
        salesManagerId: selectedManager.id,
        reason: `Score-based assignment (lead score: ${lead.leadScore.score}, manager success rate: ${selectedManager.successRate?.toFixed(1)}%)`
      });

      // Update current load
      selectedManager.currentLoad++;
    }

    return assignments;
  }

  /**
   * Distribute leads using Territory-Based algorithm
   */
  distributeTerritoryBased(
    leads: LeadWithScore[], 
    salesManagers: SalesManagerWithStats[],
    territoryMapping?: Record<string, string[]>,
    maxLeadsPerManager?: number
  ): Array<{ leadId: string; salesManagerId: string; reason: string }> {
    const assignments: Array<{ leadId: string; salesManagerId: string; reason: string }> = [];
    const workingManagers = [...salesManagers];

    for (const lead of leads) {
      let selectedManager: SalesManagerWithStats | undefined;
      let reason = "Territory-based assignment";

      // Try to match by territory if we have location data for the lead
      if (lead.leadScore.locationSearches && territoryMapping) {
        for (const location of lead.leadScore.locationSearches) {
          for (const [territory, managerIds] of Object.entries(territoryMapping)) {
            if (location.toLowerCase().includes(territory.toLowerCase())) {
              const territoryManagers = workingManagers.filter(manager => 
                managerIds.includes(manager.id) &&
                (!maxLeadsPerManager || manager.currentLoad < maxLeadsPerManager)
              );
              
              if (territoryManagers.length > 0) {
                // Pick the least loaded manager in this territory
                territoryManagers.sort((a, b) => a.currentLoad - b.currentLoad);
                selectedManager = territoryManagers[0];
                reason = `Territory match: ${territory} (location: ${location})`;
                break;
              }
            }
          }
          if (selectedManager) break;
        }
      }

      // If no territory match found, fall back to load balancing
      if (!selectedManager) {
        const availableManagers = maxLeadsPerManager ? 
          workingManagers.filter(manager => manager.currentLoad < maxLeadsPerManager) :
          workingManagers;

        if (availableManagers.length === 0) break;

        availableManagers.sort((a, b) => a.currentLoad - b.currentLoad);
        selectedManager = availableManagers[0];
        reason = "Territory fallback: Load balanced";
      }

      if (!selectedManager) continue;

      assignments.push({
        leadId: lead.id,
        salesManagerId: selectedManager.id,
        reason
      });

      // Update current load
      selectedManager.currentLoad++;
    }

    return assignments;
  }

  /**
   * Main distribution function that routes to appropriate algorithm
   */
  async distributeLeads(
    rule: DistributionRule,
    leadIds?: string[],
    salesManagerIds?: string[]
  ): Promise<{
    assignments: Array<{ leadId: string; salesManagerId: string; reason: string; metadata: any }>;
    stats: {
      totalLeads: number;
      assignedLeads: number;
      failedAssignments: number;
      distributionMethod: string;
    };
  }> {
    // Get available sales managers
    const availableManagers = await this.getAvailableSalesManagers();

    const selectedManagers = salesManagerIds ? 
      availableManagers.filter(manager => salesManagerIds.includes(manager.id)) :
      availableManagers;

    if (selectedManagers.length === 0) {
      throw new Error("No available sales managers found");
    }

    // Get leads to distribute
    let leadsToDistribute: LeadWithScore[];

    if (leadIds) {
      const leads = await prisma.user.findMany({
        where: {
          id: { in: leadIds },
          role: "USER",
          status: "ACTIVE",
        },
        include: { leadScore: true },
      });
      leadsToDistribute = leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone || undefined,
        joinDate: lead.joinDate,
        leadScore: {
          score: lead.leadScore?.score || 0,
          grade: lead.leadScore?.grade || 'COLD',
          seriousBuyerIndicator: lead.leadScore?.seriousBuyerIndicator || false,
          budgetEstimate: lead.leadScore?.budgetEstimate ? 
            parseFloat(lead.leadScore.budgetEstimate.toString()) : undefined,
          locationSearches: lead.leadScore?.locationSearches ? 
            JSON.parse(lead.leadScore.locationSearches) : undefined,
          propertyTypeInterests: lead.leadScore?.propertyTypeInterests ? 
            JSON.parse(lead.leadScore.propertyTypeInterests) : undefined,
          lastActivity: lead.leadScore?.lastActivity || undefined,
        },
      }));
    } else {
      leadsToDistribute = await this.getUnassignedLeads({
        minScore: rule.minLeadScore,
        seriousBuyersOnly: rule.prioritizeHighScorers,
        limit: rule.maxLeadsPerManager ? rule.maxLeadsPerManager * selectedManagers.length : 100,
      });
    }

    if (leadsToDistribute.length === 0) {
      throw new Error("No leads available for distribution");
    }

    // Apply distribution algorithm
    let assignments: Array<{ leadId: string; salesManagerId: string; reason: string }> = [];

    switch (rule.type) {
      case 'round_robin':
        assignments = this.distributeRoundRobin(leadsToDistribute, selectedManagers, rule.maxLeadsPerManager);
        break;
      case 'load_balanced':
        assignments = this.distributeLoadBalanced(leadsToDistribute, selectedManagers, rule.maxLeadsPerManager);
        break;
      case 'score_based':
        assignments = this.distributeScoreBased(leadsToDistribute, selectedManagers, rule.maxLeadsPerManager);
        break;
      case 'territory_based':
        assignments = this.distributeTerritoryBased(leadsToDistribute, selectedManagers, rule.territoryMapping, rule.maxLeadsPerManager);
        break;
      default:
        assignments = this.distributeLoadBalanced(leadsToDistribute, selectedManagers, rule.maxLeadsPerManager);
    }

    return {
      assignments: assignments.map(assignment => ({
        ...assignment,
        metadata: {
          leadScore: leadsToDistribute.find(l => l.id === assignment.leadId)?.leadScore,
          salesManagerStats: selectedManagers.find(sm => sm.id === assignment.salesManagerId),
        }
      })),
      stats: {
        totalLeads: leadsToDistribute.length,
        assignedLeads: assignments.length,
        failedAssignments: leadsToDistribute.length - assignments.length,
        distributionMethod: rule.type,
      }
    };
  }
}

export const leadDistributionEngine = new LeadDistributionEngine();