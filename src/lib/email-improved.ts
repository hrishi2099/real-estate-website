import nodemailer from 'nodemailer';

// Email provider type
type EmailProvider = 'smtp' | 'console' | 'sendgrid';

// Get email provider from environment
const getEmailProvider = (): EmailProvider => {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProvider;
  return provider || 'smtp';
};

// Check if email credentials are configured
const areEmailCredentialsConfigured = (): boolean => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  // Check for placeholder values
  const isPlaceholder = (value: string | undefined): boolean => {
    if (!value) return true;
    return value.includes('your-email') || 
           value.includes('your-password') || 
           value.includes('yourdomain.com') ||
           value === 'your-email@yourdomain.com' ||
           value === 'your-email-password';
  };
  
  return !isPlaceholder(user) && !isPlaceholder(pass);
};

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // For Gmail, use an app password
  },
};

// Create reusable transporter object
const createTransporter = () => {
  const provider = getEmailProvider();
  
  if (provider === 'console') {
    console.log('📧 Email provider set to console mode - emails will be logged instead of sent');
    return null;
  }
  
  if (!areEmailCredentialsConfigured()) {
    console.warn('⚠️  Email credentials not properly configured. Please check your .env file.');
    console.warn('📋 See EMAIL_SETUP_GUIDE.md for configuration instructions.');
    return null;
  }
  
  return nodemailer.createTransporter(emailConfig);
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailImproved(options: EmailOptions): Promise<boolean> {
  const provider = getEmailProvider();
  
  // Console mode for development/testing
  if (provider === 'console') {
    console.log('📧 EMAIL WOULD BE SENT (Console Mode):');
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);
    console.log('📧 Text Content:');
    console.log(options.text || 'No text content');
    console.log('📧 ==========================================');
    return true;
  }
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('❌ Email transporter not configured, skipping email send');
    console.log('💡 To fix this:');
    console.log('   1. Configure proper email credentials in .env file');
    console.log('   2. Or set EMAIL_PROVIDER=console for development');
    console.log('   3. See EMAIL_SETUP_GUIDE.md for detailed instructions');
    return false;
  }

  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Real Estate Platform'}" <${process.env.EMAIL_FROM || emailConfig.auth.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.error('💡 Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Connection refused. Check EMAIL_HOST and EMAIL_PORT in .env');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('💡 SMTP server not found. Check EMAIL_HOST in .env');
      }
    }
    
    return false;
  }
}

export function generatePasswordResetEmail(resetUrl: string, userEmail: string): { html: string; text: string } {
  const companyName = process.env.EMAIL_FROM_NAME || 'Real Estate Platform';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #ffffff;
          padding: 30px;
          border: 1px solid #dee2e6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-radius: 0 0 5px 5px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${companyName}</h1>
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        
        <p>Hello,</p>
        
        <p>We received a request to reset the password for your account associated with <strong>${userEmail}</strong>.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Important:</strong>
          <ul>
            <li>This link will expire in 24 hours</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password won't change until you create a new one</li>
          </ul>
        </div>
        
        <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
        
        <p>Best regards,<br>The ${companyName} Team</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>If you need help, contact our support team.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request - ${companyName}
    
    Hello,
    
    We received a request to reset the password for your account associated with ${userEmail}.
    
    Please visit the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 24 hours.
    
    If you didn't request this reset, please ignore this email. Your password won't change until you create a new one.
    
    Best regards,
    The ${companyName} Team
    
    ---
    This is an automated message, please do not reply to this email.
  `;

  return { html, text };
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}