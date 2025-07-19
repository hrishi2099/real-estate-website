import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, hashPassword } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { z } from 'zod'
import { Role, UserStatus } from '@prisma/client'

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
})

// GET /api/admin/users - List users (admin only)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.admin)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: {
      role?: Role;
      status?: UserStatus;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {}
    if (role) where.role = role as Role
    if (status) where.status = status as UserStatus
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: {
            select: {
              properties: true,
              inquiries: true,
              favorites: true,
            }
          }
        },
        orderBy: { joinDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    // Add property views count for each user
    const usersWithViews = await Promise.all(
      users.map(async (user) => {
        const propertyViews = await prisma.propertyAnalytics.count({
          where: {
            userId: user.id,
            event: 'VIEW'
          }
        });
        
        return {
          ...user,
          _count: {
            ...user._count,
            propertyViews
          }
        };
      })
    );

    return NextResponse.json({
      users: usersWithViews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create user (admin only)
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        joinDate: true,
        emailVerified: true,
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}