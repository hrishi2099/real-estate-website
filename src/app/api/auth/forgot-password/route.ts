import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Generate reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Generate email content
    const emailContent = generatePasswordResetEmail(resetUrl, email)

    // Send password reset email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: emailContent.html,
      text: emailContent.text
    })

    if (emailSent) {
      console.log(`Password reset email sent to: ${email}`)
    } else {
      console.log(`Failed to send email to: ${email}, but reset token created`)
      // For development, log the reset URL
      console.log(`Reset URL: ${resetUrl}`)
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}