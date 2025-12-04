import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        company: true,
        contact: true,
        createdBy: true,
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error("Meetings API error:", error)
    // Return empty array on error
    return NextResponse.json([])
  }
}

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
    if (!body.date) {
      return NextResponse.json(
        { error: "Toplantı tarihi gereklidir" },
        { status: 400 }
      )
    }
    if (!body.type) {
      return NextResponse.json(
        { error: "Toplantı tipi gereklidir" },
        { status: 400 }
      )
    }
    
    const meeting = await prisma.meeting.create({
      data: {
        companyId: body.companyId,
        contactId: body.contactId || null,
        date: new Date(body.date),
        type: body.type,
        summary: body.summary || null,
        nextStep: body.nextStep || null,
        zoomMeetingId: body.zoomMeetingId || null,
        zoomJoinUrl: body.zoomJoinUrl || null,
        zoomStartUrl: body.zoomStartUrl || null,
        zoomPassword: body.zoomPassword || null,
      },
      include: {
        company: true,
        contact: true,
      },
    })

    // Update company last contact date (don't fail if this fails)
    try {
      await prisma.company.update({
        where: { id: meeting.companyId },
        data: { lastContactDate: meeting.date },
      })
    } catch (updateError) {
      console.error("Failed to update company last contact date:", updateError)
    }

    // Activity log (don't fail if this fails)
    try {
      await prisma.activity.create({
        data: {
          companyId: meeting.companyId,
          activityType: "MEETING_CREATED",
          description: `${meeting.type} görüşmesi oluşturuldu`,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(meeting)
  } catch (error: any) {
    console.error("Create meeting error:", error)
    let errorMessage = error.message || "Failed to create meeting"
    if (error.code === "P2003") {
      errorMessage = "Geçersiz firma veya yetkili ID"
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



