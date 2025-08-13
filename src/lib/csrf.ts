import { NextRequest } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

// Generate a cryptographically secure random token
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

// Create a signed token with timestamp
export function createSignedCSRFToken(): string {
  const token = generateCSRFToken();
  const timestamp = Date.now().toString();
  const data = `${token}:${timestamp}`;
  
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  return `${data}:${signature}`;
}

// Verify a signed CSRF token
export function verifyCSRFToken(signedToken: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
  try {
    const parts = signedToken.split(':');
    if (parts.length !== 3) return false;
    
    const [token, timestamp, signature] = parts;
    const data = `${token}:${timestamp}`;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return false;
    }
    
    // Check if token is not expired
    const tokenTimestamp = parseInt(timestamp, 10);
    const now = Date.now();
    
    if (now - tokenTimestamp > maxAge) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Extract CSRF token from request
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get('X-CSRF-Token') || request.headers.get('X-XSRF-Token');
  if (headerToken) return headerToken;
  
  // For form data, we would need to parse the body
  // This is handled in the API routes themselves
  return null;
}

// CSRF protection middleware
export function validateCSRF(request: NextRequest): boolean {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }
  
  const token = getCSRFTokenFromRequest(request);
  if (!token) return false;
  
  return verifyCSRFToken(token);
}

// Generate CSRF token for client
export function getCSRFTokenForClient(): { token: string; expires: number } {
  const token = createSignedCSRFToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  return { token, expires };
}