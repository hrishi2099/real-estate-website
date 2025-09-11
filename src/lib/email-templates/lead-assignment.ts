import { Lead, LeadAssignment } from '@prisma/client';

interface SalesManagerForEmail {
  id: string;
  name: string | null;
  email: string | null;
}

interface LeadAssignmentEmailData {
  lead: Lead;
  salesManager: SalesManagerForEmail;
  assignment: LeadAssignment;
}

export function generateLeadAssignmentEmail(data: LeadAssignmentEmailData): { html: string; text: string } {
  const { lead, salesManager, assignment } = data;

  const subject = `New Lead Assigned: ${lead.name || 'N/A'}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; border-bottom: 1px solid #eee; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 10px 20px; text-align: center; font-size: 0.8em; color: #666; border-top: 1px solid #eee; }
        .detail-row { margin-bottom: 10px; }
        .detail-label { font-weight: bold; display: inline-block; width: 120px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${subject}</h2>
        </div>
        <div class="content">
          <p>Dear ${salesManager.name || 'Sales Manager'},</p>
          <p>A new lead has been assigned to you. Here are the details:</p>
          
          <div class="detail-row"><span class="detail-label">Lead Name:</span> ${lead.name || 'N/A'}</div>
          <div class="detail-row"><span class="detail-label">Email:</span> ${lead.email || 'N/A'}</div>
          <div class="detail-row"><span class="detail-label">Phone:</span> ${lead.phone || 'N/A'}</div>
          ${lead.propertyTypeInterests ? `<div class="detail-row"><span class="detail-label">Property Interests:</span> ${JSON.parse(lead.propertyTypeInterests).join(', ')}</div>` : ''}
          <div class="detail-row"><span class="detail-label">Assigned On:</span> ${new Date(assignment.assignedAt).toLocaleDateString()}</div>
          ${assignment.notes ? `<div class="detail-row"><span class="detail-label">Notes:</span> ${assignment.notes}</div>` : ''}

          <p>Please follow up with this lead promptly.</p>
          <p>Best regards,<br>Your Admin Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${subject}

    Dear ${salesManager.name || 'Sales Manager'},

    A new lead has been assigned to you. Here are the details:

    Lead Name: ${lead.name || 'N/A'}
    Email: ${lead.email || 'N/A'}
    Phone: ${lead.phone || 'N/A'}
    ${lead.propertyTypeInterests ? `Property Interests: ${JSON.parse(lead.propertyTypeInterests).join(', ')}` : ''}
    Assigned On: ${new Date(assignment.assignedAt).toLocaleDateString()}
    ${assignment.notes ? `Notes: ${assignment.notes}` : ''}

    Please follow up with this lead promptly.

    Best regards,
    Your Admin Team

    ---
    This is an automated notification. Please do not reply directly to this email.
  `;

  return { html, text };
}