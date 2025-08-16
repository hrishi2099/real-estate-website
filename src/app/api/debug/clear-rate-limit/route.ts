import { NextRequest, NextResponse } from 'next/server';
import { authLimiter, apiLimiter, strictLimiter, uploadLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with special header
    const isDev = process.env.NODE_ENV === 'development';
    const hasDebugHeader = request.headers.get('x-debug-auth') === 'clear-limits';
    
    if (!isDev && !hasDebugHeader) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Clear all rate limits
    authLimiter.clearAllLimits();
    apiLimiter.clearAllLimits();
    strictLimiter.clearAllLimits();
    uploadLimiter.clearAllLimits();

    return NextResponse.json({
      message: 'All rate limits cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to clear rate limits', 
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}