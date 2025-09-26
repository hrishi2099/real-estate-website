import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'src', 'data', 'memorableMoments.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading memorable moments data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate data structure
    if (!data.sectionInfo || !data.events || !Array.isArray(data.events)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredSectionFields = ['title', 'subtitle', 'description'];
    for (const field of requiredSectionFields) {
      if (!data.sectionInfo[field]) {
        return NextResponse.json(
          { error: `Missing required field: sectionInfo.${field}` },
          { status: 400 }
        );
      }
    }

    // Validate events
    const requiredEventFields = ['id', 'url', 'title', 'date', 'description', 'category'];
    for (const event of data.events) {
      for (const field of requiredEventFields) {
        if (!event[field]) {
          return NextResponse.json(
            { error: `Missing required field: events.${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Write to file
    const filePath = join(process.cwd(), 'src', 'data', 'memorableMoments.json');
    const jsonString = JSON.stringify(data, null, 2);

    await writeFile(filePath, jsonString, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Memorable moments data updated successfully'
    });

  } catch (error) {
    console.error('Error updating memorable moments data:', error);
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  }
}