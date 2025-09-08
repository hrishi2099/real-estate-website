import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '@/lib/prisma'; // Assuming prisma client is exported from here
import { leadDistributionEngine } from '@/lib/lead-distribution'; // Assuming distributeLead is exported from here

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const createdLeads = [];
    for (const row of json) {
      const { name, email, phone } = row as { name?: string; email?: string; phone?: string };

      if (!name || !email || !phone) {
        console.warn('Skipping row due to missing data:', row);
        continue;
      }

      try {
        const newLead = await prisma.lead.create({
          data: {
            name,
            email,
            phone,
            // Add any other default fields required for lead creation
            status: 'NEW', // Example default status
            source: 'Excel Upload', // Example default source
          },
        });
        createdLeads.push(newLead);

        // Distribute the newly created lead
        await leadDistributionEngine.distributeLeads(
          { type: 'load_balanced' }, // Default rule for single lead distribution
          [newLead.id] // Pass the new lead's ID
        );
      } catch (dbError) {
        console.error('Error creating lead or distributing:', dbError);
        // Depending on requirements, you might want to return an error or continue
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${createdLeads.length} leads.`,
      leads: createdLeads.map(lead => ({ id: lead.id, name: lead.name })),
    });

  } catch (error) {
    console.error('Error processing Excel upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process Excel file.' },
      { status: 500 }
    );
  }
}