import { NextRequest, NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Ensure database connection
    const connected = await ensureConnection()
    if (!connected) {
      throw new Error('Could not establish database connection')
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        joinDate: true,
        lastLogin: true,
        emailVerified: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is suspended or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}