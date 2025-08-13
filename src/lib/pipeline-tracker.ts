import { prisma } from "@/lib/prisma";

export interface StageTransition {
  assignmentId: string;
  fromStage?: string;
  toStage: string;
  probability?: number;
  estimatedValue?: number;
  nextAction?: string;
  nextActionDate?: Date;
  notes?: string;
  salesManagerId: string;
}

export interface PipelineActivity {
  assignmentId: string;
  activityType: string;
  description: string;
  outcome?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  salesManagerId: string;
}

export interface PipelineMetrics {
  totalValue: number;
  weightedValue: number; // Total value * probability
  avgDealSize: number;
  conversionRate: number;
  avgCycleTime: number; // Days from NEW_LEAD to WON
  stageDistribution: Record<string, number>;
  velocityByStage: Record<string, number>; // Average hours in each stage
}

export class PipelineTracker {
  
  /**
   * Get stage progression rules
   */
  static getStageProgression(): Record<string, string[]> {
    return {
      NEW_LEAD: ['CONTACTED', 'QUALIFIED', 'LOST'],
      CONTACTED: ['QUALIFIED', 'PROPOSAL_SENT', 'PROPERTY_VIEWING', 'LOST', 'ON_HOLD'],
      QUALIFIED: ['PROPOSAL_SENT', 'PROPERTY_VIEWING', 'NEGOTIATION', 'LOST'],
      PROPOSAL_SENT: ['NEGOTIATION', 'PROPERTY_VIEWING', 'APPLICATION', 'LOST', 'ON_HOLD'],
      NEGOTIATION: ['APPLICATION', 'CLOSING', 'PROPOSAL_SENT', 'LOST'],
      PROPERTY_VIEWING: ['APPLICATION', 'NEGOTIATION', 'QUALIFIED', 'LOST'],
      APPLICATION: ['CLOSING', 'NEGOTIATION', 'LOST'],
      CLOSING: ['WON', 'LOST', 'ON_HOLD'],
      ON_HOLD: ['CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'LOST'],
      WON: [], // Terminal state
      LOST: [], // Terminal state
    };
  }

  /**
   * Validate stage transition
   */
  static isValidTransition(fromStage: string, toStage: string): boolean {
    const allowedTransitions = this.getStageProgression()[fromStage] || [];
    return allowedTransitions.includes(toStage);
  }

  /**
   * Get default probability for each stage
   */
  static getDefaultProbability(stage: string): number {
    const probabilities: Record<string, number> = {
      NEW_LEAD: 10,
      CONTACTED: 20,
      QUALIFIED: 35,
      PROPOSAL_SENT: 50,
      NEGOTIATION: 65,
      PROPERTY_VIEWING: 60,
      APPLICATION: 80,
      CLOSING: 90,
      WON: 100,
      LOST: 0,
      ON_HOLD: 25,
    };
    return probabilities[stage] || 0;
  }

  /**
   * Initialize a new lead in the pipeline
   */
  async initializePipeline(assignmentId: string, salesManagerId: string): Promise<any> {
    try {
      // Check if pipeline already exists
      const existingStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId,
          exitedAt: null,
        },
      });

      if (existingStage) {
        return existingStage;
      }

      // Create initial stage
      const initialStage = await prisma.pipelineStage.create({
        data: {
          assignmentId,
          stage: 'NEW_LEAD',
          probability: PipelineTracker.getDefaultProbability('NEW_LEAD'),
          createdBy: salesManagerId,
        },
      });

      // Log initial activity
      await this.addActivity({
        assignmentId,
        activityType: 'NOTE_ADDED',
        description: 'Lead assigned to pipeline',
        salesManagerId,
      });

      return initialStage;
    } catch (error) {
      console.error('Error initializing pipeline:', error);
      throw error;
    }
  }

  /**
   * Move a lead to a new stage
   */
  async moveToStage(transition: StageTransition): Promise<any> {
    try {
      // Get current stage
      const currentStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId: transition.assignmentId,
          exitedAt: null,
        },
        orderBy: {
          enteredAt: 'desc',
        },
      });

      // Validate transition if we have a current stage
      if (currentStage && !PipelineTracker.isValidTransition(currentStage.stage, transition.toStage)) {
        throw new Error(`Invalid transition from ${currentStage.stage} to ${transition.toStage}`);
      }

      // Close current stage if it exists
      if (currentStage && currentStage.stage !== transition.toStage) {
        const exitTime = new Date();
        const durationHours = Math.ceil(
          (exitTime.getTime() - currentStage.enteredAt.getTime()) / (1000 * 60 * 60)
        );

        await prisma.pipelineStage.update({
          where: {
            id: currentStage.id,
          },
          data: {
            exitedAt: exitTime,
            durationHours,
          },
        });
      }

      // Create new stage (only if different from current)
      let newStage;
      if (!currentStage || currentStage.stage !== transition.toStage) {
        newStage = await prisma.pipelineStage.create({
          data: {
            assignmentId: transition.assignmentId,
            stage: transition.toStage as any,
            probability: transition.probability || PipelineTracker.getDefaultProbability(transition.toStage),
            estimatedValue: transition.estimatedValue,
            nextAction: transition.nextAction,
            nextActionDate: transition.nextActionDate,
            notes: transition.notes,
            createdBy: transition.salesManagerId,
          },
        });

        // Update assignment status based on stage
        await this.updateAssignmentStatus(transition.assignmentId, transition.toStage);

        // Log stage transition activity
        await this.addActivity({
          assignmentId: transition.assignmentId,
          activityType: 'NOTE_ADDED',
          description: `Stage changed to ${transition.toStage}${transition.notes ? ': ' + transition.notes : ''}`,
          salesManagerId: transition.salesManagerId,
        });
      } else {
        // Update existing stage
        newStage = await prisma.pipelineStage.update({
          where: {
            id: currentStage.id,
          },
          data: {
            probability: transition.probability || currentStage.probability,
            estimatedValue: transition.estimatedValue || currentStage.estimatedValue,
            nextAction: transition.nextAction || currentStage.nextAction,
            nextActionDate: transition.nextActionDate || currentStage.nextActionDate,
            notes: transition.notes || currentStage.notes,
          },
        });
      }

      return newStage;
    } catch (error) {
      console.error('Error moving stage:', error);
      throw error;
    }
  }

  /**
   * Add activity to current stage
   */
  async addActivity(activity: PipelineActivity): Promise<any> {
    try {
      // Get current stage
      const currentStage = await prisma.pipelineStage.findFirst({
        where: {
          assignmentId: activity.assignmentId,
          exitedAt: null,
        },
        orderBy: {
          enteredAt: 'desc',
        },
      });

      if (!currentStage) {
        // Initialize pipeline if it doesn't exist
        await this.initializePipeline(activity.assignmentId, activity.salesManagerId);
        
        // Get the newly created stage
        const newStage = await prisma.pipelineStage.findFirst({
          where: {
            assignmentId: activity.assignmentId,
            exitedAt: null,
          },
          orderBy: {
            enteredAt: 'desc',
          },
        });

        if (!newStage) {
          throw new Error('Failed to initialize pipeline');
        }
      }

      // Create activity
      const pipelineActivity = await prisma.pipelineActivity.create({
        data: {
          stageId: currentStage?.id || '',
          activityType: activity.activityType as any,
          description: activity.description,
          outcome: activity.outcome,
          scheduledAt: activity.scheduledAt,
          completedAt: activity.completedAt,
          createdBy: activity.salesManagerId,
        },
      });

      return pipelineActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  /**
   * Update assignment status based on pipeline stage
   */
  private async updateAssignmentStatus(assignmentId: string, stage: string): Promise<void> {
    let status = 'ACTIVE';
    
    switch (stage) {
      case 'WON':
        status = 'COMPLETED';
        break;
      case 'LOST':
        status = 'CANCELLED';
        break;
      case 'ON_HOLD':
        status = 'ON_HOLD';
        break;
    }

    await prisma.leadAssignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        status: status as any,
      },
    });
  }

  /**
   * Calculate pipeline metrics for a sales manager
   */
  async calculateMetrics(salesManagerId: string, timeframeDays: number = 30): Promise<PipelineMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    // Get all stages for the sales manager within timeframe
    const stages = await prisma.pipelineStage.findMany({
      where: {
        assignment: {
          salesManagerId,
          assignedAt: {
            gte: startDate,
          },
        },
      },
      include: {
        assignment: true,
      },
    });

    // Calculate metrics
    const activeStages = stages.filter(stage => !stage.exitedAt);
    const completedDeals = stages.filter(stage => stage.stage === 'WON');
    const lostDeals = stages.filter(stage => stage.stage === 'LOST');
    const totalDeals = completedDeals.length + lostDeals.length;

    const totalValue = activeStages.reduce((sum, stage) => 
      sum + (stage.estimatedValue ? Number(stage.estimatedValue) : 0), 0);
    
    const weightedValue = activeStages.reduce((sum, stage) => 
      sum + (stage.estimatedValue && stage.probability ? 
        Number(stage.estimatedValue) * (stage.probability / 100) : 0), 0);

    const avgDealSize = completedDeals.length > 0 ? 
      completedDeals.reduce((sum, stage) => 
        sum + (stage.estimatedValue ? Number(stage.estimatedValue) : 0), 0) / completedDeals.length : 0;

    const conversionRate = totalDeals > 0 ? (completedDeals.length / totalDeals) * 100 : 0;

    // Calculate stage distribution
    const stageDistribution = stages.reduce((acc, stage) => {
      acc[stage.stage] = (acc[stage.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate velocity by stage (average time spent in each stage)
    const stageVelocity = stages
      .filter(stage => stage.durationHours)
      .reduce((acc, stage) => {
        if (!acc[stage.stage]) {
          acc[stage.stage] = { total: 0, count: 0 };
        }
        acc[stage.stage].total += stage.durationHours!;
        acc[stage.stage].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

    const velocityByStage = Object.entries(stageVelocity).reduce((acc, [stage, data]) => {
      const stageData = data as { total: number; count: number };
      acc[stage] = Math.round(stageData.total / stageData.count);
      return acc;
    }, {} as Record<string, number>);

    // Calculate average cycle time (NEW_LEAD to WON)
    const wonStages = stages.filter(stage => stage.stage === 'WON');
    let avgCycleTime = 0;

    if (wonStages.length > 0) {
      const cycleTimes = wonStages.map(wonStage => {
        const newLeadStage = stages.find(stage => 
          stage.assignmentId === wonStage.assignmentId && stage.stage === 'NEW_LEAD');
        
        if (newLeadStage) {
          return Math.ceil(
            (wonStage.enteredAt.getTime() - newLeadStage.enteredAt.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
        return 0;
      }).filter(time => time > 0);

      avgCycleTime = cycleTimes.length > 0 ? 
        cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length : 0;
    }

    return {
      totalValue,
      weightedValue,
      avgDealSize,
      conversionRate,
      avgCycleTime,
      stageDistribution,
      velocityByStage,
    };
  }

  /**
   * Get upcoming actions for a sales manager
   */
  async getUpcomingActions(salesManagerId: string, days: number = 7): Promise<any[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const upcomingActions = await prisma.pipelineStage.findMany({
      where: {
        assignment: {
          salesManagerId,
        },
        nextActionDate: {
          gte: new Date(),
          lte: endDate,
        },
        exitedAt: null,
      },
      include: {
        assignment: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextActionDate: 'asc',
      },
    });

    return upcomingActions.map(stage => ({
      id: stage.id,
      stage: stage.stage,
      nextAction: stage.nextAction,
      nextActionDate: stage.nextActionDate,
      probability: stage.probability,
      estimatedValue: stage.estimatedValue,
      lead: stage.assignment.lead,
      assignmentId: stage.assignmentId,
    }));
  }
}

export const pipelineTracker = new PipelineTracker();