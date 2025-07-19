import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const key = config.keyGenerator ? config.keyGenerator(request) : getDefaultKey(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    let entry = rateLimitStore.get(key);
    
    // Clean up or initialize entry
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    // Check if rate limit exceeded
    if (entry.count > config.maxRequests) {
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${resetTimeSeconds} seconds.`,
          retryAfter: resetTimeSeconds
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': resetTimeSeconds.toString()
          }
        }
      );
    }
    
    return null; // Allow request to proceed
  };
}

function getDefaultKey(request: NextRequest): string {
  // Use forwarded IP or connection IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Include user agent to prevent simple IP spoofing
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent.substring(0, 50)}`;
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Stricter limits for admin endpoints
  adminStrict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  },
  
  // General admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200 // 200 requests per 15 minutes
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  },
  
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000 // 1000 requests per 15 minutes
  }
};

// Helper function to apply rate limiting to admin endpoints
export function withAdminRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.admin
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResponse = rateLimit(config)(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request, ...args);
  };
}