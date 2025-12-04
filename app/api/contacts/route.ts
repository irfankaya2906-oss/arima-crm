import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.companyId) {
      return NextResponse.json(
        { error: "Firma ID gereklidir" },
        { status: 400 }
      )
    }
    if (!body.fullName || body.fullName.trim() === "") {
      return NextResponse.json(
        { error: "Yetkili adı gereklidir" },
        { status: 400 }
      )
    }
    
    const contact = await prisma.contact.create({
      data: {
        companyId: body.companyId,
        fullName: body.fullName,
        position: body.position || null,
        phone: body.phone || null,
        email: body.email || null,
        notes: body.notes || null,
      },
      include: {
        company: true,
      },
    })

    // Activity log (don't fail if this fails)
    try {
      await prisma.activity.create({
        data: {
          companyId: contact.companyId,
          activityType: "CONTACT_ADDED",
          description: `${contact.fullName} yetkilisi eklendi`,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(contact)
  } catch (error: any) {
    console.error("Create contact error:", error)
    let errorMessage = error.message || "Failed to create contact"
    if (error.code === "P2003") {
      errorMessage = "Geçersiz firma ID"
    }
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined
      },
      { status: 500 }
    )
  }
}



