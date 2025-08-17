import { NextRequest, NextResponse } from 'next/server'
import { sendEmailImproved, testEmailConfig, generatePasswordResetEmail } from '@/lib/email-improved'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') || 'test@example.com'
    const type = url.searchParams.get('type') || 'test'

    console.log('🧪 Testing email configuration...')
    
    // Test email configuration
    const configValid = await testEmailConfig()
    
    // Generate test email content
    let emailContent
    let subject = 'Test Email from Real Estate Platform'
    
    if (type === 'forgot-password') {
      const testResetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=test-token-123`
      emailContent = generatePasswordResetEmail(testResetUrl, email)
      subject = 'Test Password Reset Email'
    } else {
      emailContent = {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Test Email</h2>
            <p>This is a test email from your Real Estate Platform.</p>
            <p><strong>Recipient:</strong> ${email}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>If you can see this email, your email configuration is working correctly!</p>
          </div>
        `,
        text: `
          Test Email from Real Estate Platform
          
          This is a test email.
          Recipient: ${email}
          Timestamp: ${new Date().toISOString()}
          
          If you can see this email, your email configuration is working correctly!
        `
      }
    }

    // Try sending the email
    console.log(`📧 Attempting to send test email to: ${email}`)
    const emailSent = await sendEmailImproved({
      to: email,
      subject,
      html: emailContent.html,
      text: emailContent.text
    })

    // Get environment info
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp'
    const emailHost = process.env.EMAIL_HOST || 'not configured'
    const emailUser = process.env.EMAIL_USER || 'not configured'
    const emailFrom = process.env.EMAIL_FROM || 'not configured'
    
    // Mask sensitive information
    const maskEmail = (email: string) => {
      if (!email || email === 'not configured') return email
      const [local, domain] = email.split('@')
      return `${local.substring(0, 2)}***@${domain}`
    }

    const response = {
      success: emailSent,
      configValid,
      email,
      type,
      provider: emailProvider,
      configuration: {
        host: emailHost,
        user: maskEmail(emailUser),
        from: maskEmail(emailFrom),
        port: process.env.EMAIL_PORT || 'not configured',
        secure: process.env.EMAIL_SECURE || 'not configured'
      },
      message: emailSent 
        ? `Test email sent successfully to ${email}` 
        : `Failed to send test email to ${email}`,
      instructions: emailSent 
        ? 'Check your email inbox (and spam folder) for the test email.'
        : 'Email sending failed. Check the configuration and see EMAIL_SETUP_GUIDE.md for help.'
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test email configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    // Same logic as GET but with POST body
    return GET(new Request(`${request.url}?email=${email}&type=${type}`))
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}