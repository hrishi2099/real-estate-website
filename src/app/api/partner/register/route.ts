import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  // Personal Information
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/[\d]/, 'Phone number must contain digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),

  // Company Information
  companyName: z.string().trim().min(1, 'Company name is required'),
  companyRegistration: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().default('India'),

  // Optional Banking Information
  bankAccountName: z.string().trim().optional().or(z.literal('')),
  bankAccountNumber: z.string().trim().optional().or(z.literal('')),
  bankIFSC: z.string().trim().optional().or(z.literal('')),
  panNumber: z.string().trim().optional().or(z.literal('')),
  gstNumber: z.string().trim().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[PARTNER REGISTRATION] Request received at:', new Date().toISOString());
    const body = await request.json();
    console.log('[PARTNER REGISTRATION] Request body:', JSON.stringify(body, null, 2));

    const validatedData = registerSchema.parse(body);
    console.log('[PARTNER REGISTRATION] Validation passed');

    // Check if user already exists
    console.log('[PARTNER REGISTRATION] Checking for existing user with email:', validatedData.email);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      console.log('[PARTNER REGISTRATION] User already exists');
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('[PARTNER REGISTRATION] Hashing password');
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('[PARTNER REGISTRATION] Password hashed successfully');

    // Helper function to convert empty strings to undefined for optional fields
    const toOptional = (value: string | undefined) => value && value.trim() !== '' ? value : undefined;

    // Create user and channel partner in a transaction
    console.log('[PARTNER REGISTRATION] Starting database transaction');
    const result = await prisma.$transaction(async (tx) => {
      // Create user with CHANNEL_PARTNER role
      console.log('[PARTNER REGISTRATION] Creating user record');
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          password: hashedPassword,
          role: 'CHANNEL_PARTNER',
          status: 'ACTIVE',
          emailVerified: false,
        },
      });
      console.log('[PARTNER REGISTRATION] User created with ID:', user.id);

      // Create channel partner profile
      console.log('[PARTNER REGISTRATION] Creating channel partner record');
      const partner = await tx.channelPartner.create({
        data: {
          userId: user.id,
          companyName: validatedData.companyName,
          companyRegistration: toOptional(validatedData.companyRegistration),
          website: toOptional(validatedData.website),
          city: validatedData.city, // Required field
          state: validatedData.state, // Required field
          country: validatedData.country,
          baseCommission: 5.0, // Default 5% commission
          performanceTier: 'BRONZE',
          status: 'PENDING', // Requires admin approval
          bankAccountName: toOptional(validatedData.bankAccountName),
          bankAccountNumber: toOptional(validatedData.bankAccountNumber),
          bankIFSC: toOptional(validatedData.bankIFSC),
          panNumber: toOptional(validatedData.panNumber),
          gstNumber: toOptional(validatedData.gstNumber),
        },
      });
      console.log('[PARTNER REGISTRATION] Channel partner created with ID:', partner.id);

      return { user, partner };
    });

    console.log('[PARTNER REGISTRATION] Transaction completed successfully');

    // TODO: Send welcome email and notify admin

    return NextResponse.json(
      {
        message: 'Registration successful. Your application is pending approval.',
        userId: result.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[PARTNER REGISTRATION] ERROR occurred:', error);

    if (error instanceof z.ZodError) {
      // Format validation errors for better user experience
      const formattedErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      console.error('[PARTNER REGISTRATION] Validation error:', JSON.stringify(formattedErrors, null, 2));

      return NextResponse.json(
        {
          error: 'Validation failed. Please check the following fields:',
          details: error.issues,
          formattedErrors
        },
        { status: 400 }
      );
    }

    console.error('[PARTNER REGISTRATION] Database/System error:', error);
    console.error('[PARTNER REGISTRATION] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };

      // Unique constraint violation
      if (prismaError.code === 'P2002') {
        const field = prismaError.meta?.target?.[0] || 'field';
        return NextResponse.json(
          { error: `A user with this ${field} already exists.` },
          { status: 400 }
        );
      }

      // Foreign key constraint failed
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid reference data provided.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again. If the problem persists, contact support.' },
      { status: 500 }
    );
  }
}
