import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  // Personal Information
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),

  // Company Information
  companyName: z.string().min(1, 'Company name is required'),
  companyRegistration: z.string().optional(),
  website: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),

  // Optional Banking Information
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIFSC: z.string().optional(),
  panNumber: z.string().optional(),
  gstNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user and channel partner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with CHANNEL_PARTNER role
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

      // Create channel partner profile
      const partner = await tx.channelPartner.create({
        data: {
          userId: user.id,
          companyName: validatedData.companyName,
          companyRegistration: validatedData.companyRegistration,
          website: validatedData.website,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          baseCommission: 5.0, // Default 5% commission
          performanceTier: 'BRONZE',
          status: 'PENDING', // Requires admin approval
          bankAccountName: validatedData.bankAccountName,
          bankAccountNumber: validatedData.bankAccountNumber,
          bankIFSC: validatedData.bankIFSC,
          panNumber: validatedData.panNumber,
          gstNumber: validatedData.gstNumber,
        },
      });

      return { user, partner };
    });

    // TODO: Send welcome email and notify admin

    return NextResponse.json(
      {
        message: 'Registration successful. Your application is pending approval.',
        userId: result.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Partner registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
