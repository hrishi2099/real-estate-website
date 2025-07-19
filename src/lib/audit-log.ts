import { prisma } from './prisma';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Don't throw - logging should not break the main operation
  }
}

export function getClientInfo(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0] : 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

// Audit action types
export const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  
  // Property management
  PROPERTY_CREATED: 'property.created',
  PROPERTY_UPDATED: 'property.updated',
  PROPERTY_DELETED: 'property.deleted',
  PROPERTY_STATUS_CHANGED: 'property.status_changed',
  
  // Inquiry management
  INQUIRY_CREATED: 'inquiry.created',
  INQUIRY_UPDATED: 'inquiry.updated',
  INQUIRY_DELETED: 'inquiry.deleted',
  
  // Settings
  SETTINGS_UPDATED: 'settings.updated',
  
  // Bulk operations
  BULK_DELETE: 'bulk.delete',
  BULK_UPDATE: 'bulk.update',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];