import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('kmlFile') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.kml')) {
      return NextResponse.json({ error: 'Invalid file type. Only KML files are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'kml');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomSuffix}.kml`;
    const filepath = join(uploadsDir, filename);

    // Read file content and validate KML
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf-8');

    // Basic KML validation
    if (!content.includes('<kml') && !content.includes('<?xml')) {
      return NextResponse.json({ error: 'Invalid KML file format' }, { status: 400 });
    }

    // Additional validation for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        return NextResponse.json({ error: 'KML file contains potentially dangerous content' }, { status: 400 });
      }
    }

    // Write file to uploads directory
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/kml/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      message: 'KML file uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading KML file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}