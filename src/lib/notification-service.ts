import { prisma } from './prisma'

export interface NotificationData {
  userId: string
  type: 'INQUIRY_ASSIGNED' | 'INQUIRY_UPDATED' | 'INQUIRY_DEADLINE' | 'GENERAL'
  title: string
  message: string
  data?: Record<string, any>
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

export class NotificationService {
  /**
   * Send notification to a specific user
   */
  static async sendNotification(notification: NotificationData) {
    try {
      // For now, we'll use the existing RCS messaging system
      // In a real implementation, you might want to create a dedicated notifications table
      
      const message = await prisma.rCSMessage.create({
        data: {
          title: notification.title,
          content: notification.message,
          messageType: 'TEXT',
          status: 'SENT',
          targetAudience: 'CUSTOM_LIST',
          priority: notification.priority || 'NORMAL',
          createdById: 'system', // You might want to use an admin user ID here
          personalizationData: JSON.stringify(notification.data || {}),
        }
      })

      // Create recipient for the specific user
      await prisma.rCSRecipient.create({
        data: {
          messageId: message.id,
          userId: notification.userId,
          status: 'SENT',
          sentAt: new Date(),
        }
      })

      return { success: true, messageId: message.id }
    } catch (error) {
      console.error('Error sending notification:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  /**
   * Send inquiry assignment notification to sales manager
   */
  static async notifyInquiryAssignment(
    salesManagerId: string,
    inquiryId: string,
    inquiryData: {
      name: string
      email: string
      subject: string
      priority?: string
    }
  ) {
    const priority = inquiryData.priority === 'HIGH' ? 'HIGH' : 'NORMAL'
    
    return this.sendNotification({
      userId: salesManagerId,
      type: 'INQUIRY_ASSIGNED',
      title: 'New Contact Inquiry Assigned',
      message: `You have been assigned a new contact inquiry from ${inquiryData.name} regarding "${inquiryData.subject}". Please respond promptly.`,
      priority: priority as any,
      data: {
        inquiryId,
        contactName: inquiryData.name,
        contactEmail: inquiryData.email,
        subject: inquiryData.subject,
        priority: inquiryData.priority,
        assignedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Send bulk assignment notification
   */
  static async notifyBulkAssignment(
    salesManagerId: string,
    inquiryCount: number,
    inquiryData: {
      names: string[]
      subjects: string[]
    }
  ) {
    return this.sendNotification({
      userId: salesManagerId,
      type: 'INQUIRY_ASSIGNED',
      title: `${inquiryCount} Contact Inquiries Assigned`,
      message: `You have been assigned ${inquiryCount} new contact inquiries. Please review and respond to them promptly.`,
      priority: 'NORMAL',
      data: {
        inquiryCount,
        contactNames: inquiryData.names,
        subjects: inquiryData.subjects,
        assignedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Send inquiry status update notification
   */
  static async notifyInquiryUpdate(
    salesManagerId: string,
    inquiryId: string,
    oldStatus: string,
    newStatus: string,
    inquiryData: {
      name: string
      subject: string
    }
  ) {
    return this.sendNotification({
      userId: salesManagerId,
      type: 'INQUIRY_UPDATED',
      title: 'Contact Inquiry Status Updated',
      message: `The status of inquiry from ${inquiryData.name} regarding "${inquiryData.subject}" has been updated from ${oldStatus} to ${newStatus}.`,
      priority: 'LOW',
      data: {
        inquiryId,
        contactName: inquiryData.name,
        subject: inquiryData.subject,
        oldStatus,
        newStatus,
        updatedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Send deadline reminder notification
   */
  static async notifyDeadlineReminder(
    salesManagerId: string,
    inquiryId: string,
    deadline: Date,
    inquiryData: {
      name: string
      subject: string
    }
  ) {
    const hoursUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60))
    
    return this.sendNotification({
      userId: salesManagerId,
      type: 'INQUIRY_DEADLINE',
      title: 'Contact Inquiry Deadline Approaching',
      message: `The response deadline for inquiry from ${inquiryData.name} regarding "${inquiryData.subject}" is approaching (${hoursUntilDeadline} hours remaining).`,
      priority: hoursUntilDeadline <= 2 ? 'HIGH' : 'NORMAL',
      data: {
        inquiryId,
        contactName: inquiryData.name,
        subject: inquiryData.subject,
        deadline: deadline.toISOString(),
        hoursRemaining: hoursUntilDeadline
      }
    })
  }
}
