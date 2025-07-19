import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, testEmailConfig, generatePasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = 'test' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Test email configuration first
    const configValid = await testEmailConfig()
    if (!configValid) {
      return NextResponse.json(
        { 
          error: 'Email configuration is invalid or missing',
          details: 'Please check your EMAIL_* environment variables'
        },
        { status: 500 }
      )
    }

    let emailSent = false

    if (type === 'reset') {
      // Test password reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/reset-password?token=test-token-123`
      const emailContent = generatePasswordResetEmail(resetUrl, email)
      
      emailSent = await sendEmail({
        to: email,
        subject: 'Test Password Reset Email',
        html: emailContent.html,
        text: emailContent.text
      })
    } else {
      // Test basic email
      emailSent = await sendEmail({
        to: email,
        subject: 'Test Email - Real Estate Platform',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p>If you received this email, your forgot password functionality should work properly.</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        `,
        text: `
          Email Configuration Test
          
          This is a test email to verify your email configuration is working correctly.
          If you received this email, your forgot password functionality should work properly.
          
          Time sent: ${new Date().toISOString()}
        `
      })
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}