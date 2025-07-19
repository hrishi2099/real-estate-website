import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, hashPassword } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  emailVerified: z.boolean().optional(),
})

// GET /api/admin/users/[id] - Get user details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.admin)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const resolvedParams = await params;
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (userPayload.role !== 'ADMIN' && userPayload.userId !== resolvedParams.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
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
        properties: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
          }
        },
        inquiries: {
          select: {
            id: true,
            message: true,
            status: true,
            createdAt: true,
            property: {
              select: {
                title: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        favorites: {
          select: {
            id: true,
            createdAt: true,
            property: {
              select: {
                id: true,
                title: true,
                price: true,
                location: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            properties: true,
            inquiries: true,
            favorites: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const resolvedParams = await params;
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
    const data = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = { ...data }

    // Hash password if provided
    if (data.password) {
      updateData.password = await hashPassword(data.password)
    }

    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
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

    return NextResponse.json({
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.adminStrict)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const resolvedParams = await params;
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

    // Prevent admin from deleting themselves
    if (userPayload.userId === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}