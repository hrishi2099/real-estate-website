import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE /api/properties/[id]/images/[imageId] - Delete property image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
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

    // Check if image exists and belongs to the property
    const image = await prisma.propertyImage.findFirst({
      where: {
        id: resolvedParams.imageId,
        propertyId: resolvedParams.id,
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.propertyImage.delete({
      where: { id: resolvedParams.imageId }
    })

    // Try to delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', 'uploads', image.filename)
      await unlink(filepath)
    } catch (fileError) {
      // File might not exist or be accessible, but we've removed from DB
      console.warn('Could not delete file:', image.filename, fileError)
    }

    return NextResponse.json({
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id]/images/[imageId] - Update image (e.g., set as primary)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
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
    const { isPrimary } = body

    // Check if image exists and belongs to the property
    const image = await prisma.propertyImage.findFirst({
      where: {
        id: resolvedParams.imageId,
        propertyId: resolvedParams.id,
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: resolvedParams.id,
          isPrimary: true,
        },
        data: { isPrimary: false }
      })
    }

    // Update the image
    const updatedImage = await prisma.propertyImage.update({
      where: { id: resolvedParams.imageId },
      data: { isPrimary: isPrimary ?? image.isPrimary }
    })

    return NextResponse.json({
      message: 'Image updated successfully',
      image: updatedImage
    })
  } catch (error) {
    console.error('Update image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}