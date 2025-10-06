import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Define allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const eventId: string | null = data.get('eventId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize image with sharp
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid image file or corrupted data'
      }, { status: 400 });
    }

    // Store metadata for returning to client
    const imageData = {
      data: optimizedBuffer,
      mimeType: 'image/jpeg',
      size: optimizedBuffer.length,
      eventId: eventId
    };

    // Return a temporary data URL that the frontend will use to update the event
    // The actual saving to database happens when the event is saved
    const base64Image = optimizedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      imageData: base64Image,
      mimeType: 'image/jpeg',
      originalName: file.name,
      size: optimizedBuffer.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}