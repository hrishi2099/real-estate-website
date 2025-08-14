import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: (req) => this.getClientIdentifier(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private getClientIdentifier(req: NextRequest): string {
    // Try to get client IP from various headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    const ip = forwarded?.split(',')[0].trim() || 
               realIp || 
               cfConnectingIp || 
               'unknown';
    
    return `${ip}:${req.nextUrl.pathname}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  public isAllowed(req: NextRequest): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.options.keyGenerator!(req);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    let record = this.store[key];

    // Reset if window has passed
    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + this.options.windowMs,
      };
      this.store[key] = record;
    }

    // Check if limit exceeded
    if (record.count >= this.options.maxRequests) {
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
    }

    // Increment counter
    record.count++;

    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: this.options.maxRequests - record.count,
    };
  }
<<<<<<< HEAD

  public get maxRequests(): number {
    return this.options.maxRequests;
  }
=======
>>>>>>> a39292c552ade54da3e8cf4b38c762ba6ec31b0f
}

// Predefined rate limiters for different endpoints
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const strictLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for sensitive operations
});

export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 uploads per hour
});

// Middleware function factory
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return (req: NextRequest) => {
    const result = limiter.isAllowed(req);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime! - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
<<<<<<< HEAD
            'X-RateLimit-Limit': limiter.maxRequests.toString(),
=======
            'X-RateLimit-Limit': limiter.options.maxRequests.toString(),
>>>>>>> a39292c552ade54da3e8cf4b38c762ba6ec31b0f
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetTime! / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    return {
      headers: {
<<<<<<< HEAD
        'X-RateLimit-Limit': limiter.maxRequests.toString(),
=======
        'X-RateLimit-Limit': limiter.options.maxRequests.toString(),
>>>>>>> a39292c552ade54da3e8cf4b38c762ba6ec31b0f
        'X-RateLimit-Remaining': result.remaining!.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime! / 1000).toString(),
      },
    };
  };
}

export default RateLimiter;