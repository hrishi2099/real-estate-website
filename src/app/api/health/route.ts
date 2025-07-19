import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseSetup, createAdminUser } from '@/lib/database-check';

export async function GET(request: NextRequest) {
  try {
    const dbCheck = await checkDatabaseSetup();
    
    if (!dbCheck.success) {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        error: dbCheck.error,
        message: 'Database connection failed. Please check your DATABASE_URL and ensure the database is accessible.'
      }, { status: 503 });
    }

    // Check if we need to create an admin user
    const searchParams = new URL(request.url).searchParams;
    const setupAdmin = searchParams.get('setup-admin') === 'true';
    
    let adminSetup = null;
    if (setupAdmin) {
      adminSetup = await createAdminUser();
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount: dbCheck.userCount,
      timestamp: new Date().toISOString(),
      ...(adminSetup && { adminSetup })
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed'
    }, { status: 500 });
  }
}