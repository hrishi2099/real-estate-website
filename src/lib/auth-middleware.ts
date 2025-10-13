import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

// Authentication middleware for API routes
export function requireAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add user to request object
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;
    
    return handler(authenticatedReq, ...args);
  };
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return requireAuth(async (req: AuthenticatedRequest, ...args: any[]): Promise<NextResponse> => {
      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(req, ...args);
    });
  };
}

// Admin-only middleware
export const requireAdmin = requireRole(['ADMIN']);

// Channel Partner-only middleware
export const requireChannelPartner = requireRole(['CHANNEL_PARTNER']);

// Middleware to check if user owns resource or is admin
export function requireOwnershipOrAdmin(getUserId: (req: NextRequest, ...args: any[]) => string | Promise<string>) {
  return function(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return requireAuth(async (req: AuthenticatedRequest, ...args: any[]): Promise<NextResponse> => {
      const resourceUserId = await getUserId(req, ...args);
      
      if (req.user.role !== 'ADMIN' && req.user.userId !== resourceUserId) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Access denied' },
          { status: 403 }
        );
      }
      
      return handler(req, ...args);
    });
  };
}

// Rate limiting enhancement for authenticated users
export function enhancedRateLimit(req: NextRequest): string {
  const user = getUserFromRequest(req);
  
  if (user) {
    // Use user ID for authenticated requests
    return `user:${user.userId}:${req.nextUrl.pathname}`;
  }
  
  // Fall back to IP for unauthenticated requests
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0].trim() || 
             realIp || 
             cfConnectingIp || 
             'unknown';
  
  return `ip:${ip}:${req.nextUrl.pathname}`;
}

// Session management utilities
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: number;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(user: JWTPayload): string {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  
  sessions.set(sessionId, {
    userId: user.userId,
    email: user.email,
    role: user.role,
    lastActivity: now,
    createdAt: now,
  });
  
  return sessionId;
}

export function getSession(sessionId: string): SessionData | null {
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Check if session is expired
  if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
    sessions.delete(sessionId);
    return null;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  return session;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
    }
  }
}

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);