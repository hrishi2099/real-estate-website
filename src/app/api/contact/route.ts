import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const contactInquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "NEW",
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact inquiry submitted successfully",
        id: contactInquiry.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit contact inquiry" },
      { status: 500 }
    );
  }
}