import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';
import { officeSettingsSchema } from '@/lib/validation';

export async function GET() {
  try {
    const settings = await prisma.officeSettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      const newSettings = await prisma.officeSettings.create({ data: {} });
      return NextResponse.json(newSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = requireAdmin(async (req) => {
  const body = await req.json();

  const validation = officeSettingsSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  try {
    const updatedSettings = await prisma.officeSettings.updateMany({
      data: validation.data,
    });

    revalidateTag('settings');

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});