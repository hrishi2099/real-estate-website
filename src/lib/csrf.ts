import { NextRequest } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

// Generate a cryptographically secure random token
export function generateCSRFToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API (Edge Runtime compatible)
    const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for Node.js runtime
    const crypto = require('crypto');
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }
}

// Helper function to create HMAC using Web Crypto API
async function createHmac(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);
  const dataBytes = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to create HMAC using Node.js crypto (fallback)
function createHmacSync(key: string, data: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  return hmac.digest('hex');
}

// Create a signed token with timestamp
export function createSignedCSRFToken(): string {
  const token = generateCSRFToken();
  const timestamp = Date.now().toString();
  const data = `${token}:${timestamp}`;
  
  try {
    // Try sync version for Node.js runtime
    const signature = createHmacSync(CSRF_SECRET, data);
    return `${data}:${signature}`;
  } catch {
    // This shouldn't happen in practice since we're in middleware
    throw new Error('CSRF token generation failed');
  }
}

// Verify a signed CSRF token
export function verifyCSRFToken(signedToken: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
  try {
    const parts = signedToken.split(':');
    if (parts.length !== 3) return false;
    
    const [token, timestamp, signature] = parts;
    const data = `${token}:${timestamp}`;
    
    // Verify signature
    const expectedSignature = createHmacSync(CSRF_SECRET, data);
    
    // Simple constant-time comparison
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    if (result !== 0) {
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
  
  // Check cookie as fallback
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (cookieToken) return cookieToken;
  
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