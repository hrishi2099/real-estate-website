import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

// Validate required environment variables
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (typeof console !== 'undefined' && console.error) {
    console.error('WARNING: JWT_SECRET environment variable is not set. Using fallback for development.')
  }
  return 'dev-secret-key-change-in-production'
})()

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-key-change-in-production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h', // Reduced from 7d for better security
    issuer: 'real-estate-app',
    audience: 'real-estate-users',
    algorithm: 'HS256'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'real-estate-app',
      audience: 'real-estate-users',
      algorithms: ['HS256']
    }) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('auth-token')
  return tokenCookie?.value || null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  return verifyToken(token)
}