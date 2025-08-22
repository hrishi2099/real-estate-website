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
  console.log("Received settings update request with body:", body);

  const validation = officeSettingsSchema.safeParse(body);
  if (!validation.success) {
    console.error("Settings validation failed:", validation.error.issues);
    return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
  }

  console.log("Validated settings data:", validation.data);

  try {
    const settings = await prisma.officeSettings.findFirst();
    if (!settings) {
        console.log("No existing settings found, creating new one.");
        const newSettings = await prisma.officeSettings.create({
            data: validation.data,
        });
        console.log("Created new settings:", newSettings);
        revalidateTag('settings');
        return NextResponse.json(newSettings);
    }

    console.log("Found existing settings with id:", settings.id);
    const updatedSettings = await prisma.officeSettings.update({
      where: { id: settings.id },
      data: validation.data,
    });
    console.log("Updated settings in database:", updatedSettings);

    revalidateTag('settings');

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});