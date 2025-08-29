import { NextRequest, NextResponse } from 'next/server';
import { authLimiter, apiLimiter, strictLimiter, uploadLimiter, createRateLimitMiddleware } from './lib/rate-limiter';

// Security headers
const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.doubleclick.net https://www.googleadservices.com https://*.googletagmanager.com https://www.google.com https://www.google.co.in https://ad.doubleclick.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.google.com https://www.gstatic.com https://*.googletagmanager.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http: https://www.google-analytics.com https://www.google.com https://www.google.co.in https://stats.g.doubleclick.net https://ad.doubleclick.net https://*.googletagmanager.com",
    "connect-src 'self' https://www.google-analytics.com https://api.whatsapp.com https://*.doubleclick.net https://www.googleadservices.com https://stats.g.doubleclick.net https://*.googletagmanager.com https://www.google.com",
    "frame-src 'self' https://www.googletagmanager.com https://bid.g.doubleclick.net",
    "frame-ancestors 'none'",
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting based on route
  let rateLimitResult;
  
  if (pathname.startsWith('/api/auth/')) {
    rateLimitResult = createRateLimitMiddleware(authLimiter)(request);
  } else if (pathname.startsWith('/api/upload') || pathname.includes('images')) {
    rateLimitResult = createRateLimitMiddleware(uploadLimiter)(request);
  } else if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/analytics/')) {
    rateLimitResult = createRateLimitMiddleware(strictLimiter)(request);
  } else if (pathname.startsWith('/api/')) {
    rateLimitResult = createRateLimitMiddleware(apiLimiter)(request);
  }
  
  // If rate limit exceeded, return the error response
  if (rateLimitResult && rateLimitResult instanceof Response) {
    return rateLimitResult;
  }
  
  // CSRF protection removed for compatibility
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add rate limit headers if available
  if (rateLimitResult && rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Only allow specific origins in production
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL].filter(Boolean) as string[]
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    const origin = request.headers.get('origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'production' && allowedOrigins.length > 0) {
      // In production, if no origin matches, use the first allowed origin
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }
  
  // Add anti-clickjacking for admin pages
  if (pathname.startsWith('/admin/')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};