import { NextRequest, NextResponse } from 'next/server';
import { getCSRFTokenForClient } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    const { token, expires } = getCSRFTokenForClient();
    
    const response = NextResponse.json({
      csrfToken: token,
      expires,
    });
    
    // Set as HTTP-only cookie for additional security
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better cross-site compatibility
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}