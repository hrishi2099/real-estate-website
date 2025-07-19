import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { ContactInquiryStatus } from '@prisma/client'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: {
      status?: ContactInquiryStatus;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {}

    if (status) {
      where.status = status as ContactInquiryStatus
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const contactInquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const worksheetData = contactInquiries.map(inquiry => ({
      'ID': inquiry.id,
      'Name': inquiry.name,
      'Email': inquiry.email,
      'Phone': inquiry.phone || 'N/A',
      'Subject': inquiry.subject,
      'Message': inquiry.message,
      'Status': inquiry.status,
      'Created Date': inquiry.createdAt.toLocaleDateString(),
      'Created Time': inquiry.createdAt.toLocaleTimeString(),
      'Last Updated': inquiry.updatedAt.toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Inquiries')

    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `contact-inquiries-${currentDate}.xlsx`

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Export contact inquiries error:', error)
    return NextResponse.json(
      { error: 'Failed to export contact inquiries' },
      { status: 500 }
    )
  }
}