import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Send RCS message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  
  try {

    // Get message with recipients
    const message = await prisma.rCSMessage.findUnique({
      where: { id: messageId },
      include: {
        recipients: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    if (message.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: "Only draft messages can be sent",
        },
        { status: 400 }
      );
    }

    // Update message status to SENDING
    await prisma.rCSMessage.update({
      where: { id: messageId },
      data: {
        status: 'SENDING',
      },
    });

    // Simulate sending process (in real implementation, this would integrate with RCS service)
    const sendResults = await simulateRCSSending(message);

    // Update message status based on results
    const finalStatus = sendResults.failed === 0 ? 'SENT' : 
                       sendResults.sent === 0 ? 'FAILED' : 'SENT';

    await prisma.rCSMessage.update({
      where: { id: messageId },
      data: {
        status: finalStatus,
        sentAt: new Date(),
      },
    });

    // Create delivery report
    await prisma.messageDeliveryReport.create({
      data: {
        messageId,
        totalSent: sendResults.sent,
        totalDelivered: sendResults.delivered,
        totalRead: 0, // Will be updated later via webhooks
        totalClicked: 0, // Will be updated later via webhooks
        totalFailed: sendResults.failed,
        deliveryRate: sendResults.sent > 0 ? (sendResults.delivered / sendResults.sent) * 100 : 0,
        openRate: 0,
        clickRate: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Message sent successfully to ${sendResults.sent} recipients`,
      data: {
        sent: sendResults.sent,
        delivered: sendResults.delivered,
        failed: sendResults.failed,
      },
    });

  } catch (error) {
    console.error("Error sending message:", error);
    
    // Update message status to FAILED if error occurs
    try {
      await prisma.rCSMessage.update({
        where: { id: messageId },
        data: { status: 'FAILED' },
      });
    } catch (updateError) {
      console.error("Error updating message status:", updateError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
      },
      { status: 500 }
    );
  }
}

// Simulate RCS message sending (replace with actual RCS service integration)
async function simulateRCSSending(message: any) {
  const results = {
    sent: 0,
    delivered: 0,
    failed: 0,
  };

  // Process each recipient
  for (const recipient of message.recipients) {
    try {
      // Simulate random success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess && recipient.user.phone) {
        // Update recipient status to SENT
        await prisma.rCSRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
        
        results.sent++;
        
        // Simulate delivery (95% of sent messages are delivered)
        if (Math.random() > 0.05) {
          setTimeout(async () => {
            await prisma.rCSRecipient.update({
              where: { id: recipient.id },
              data: {
                status: 'DELIVERED',
                deliveredAt: new Date(),
              },
            });
          }, Math.random() * 5000); // Random delay up to 5 seconds
          
          results.delivered++;
        }
      } else {
        // Update recipient status to FAILED
        await prisma.rCSRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: recipient.user.phone ? 'RCS service unavailable' : 'No phone number',
          },
        });
        
        results.failed++;
      }
      
      // Add small delay between sends
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error sending to recipient ${recipient.id}:`, error);
      results.failed++;
    }
  }

  return results;
}