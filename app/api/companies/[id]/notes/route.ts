import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notes = await prisma.note.findMany({
      where: { companyId: params.id },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error: any) {
    console.error("Get notes error:", error)
    return NextResponse.json(
      { error: "Notlar getirilemedi" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    if (!body.content || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Not içeriği gereklidir" },
        { status: 400 }
      )
    }

    const note = await prisma.note.create({
      data: {
        companyId: params.id,
        title: body.title || null,
        content: body.content,
        userId: body.userId || null,
      },
    })

    // Activity log
    try {
      await prisma.activity.create({
        data: {
          companyId: params.id,
          activityType: "NOTE_ADDED",
          description: `Not eklendi: ${body.title || "Başlıksız"}`,
          userId: body.userId || null,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(note)
  } catch (error: any) {
    console.error("Create note error:", error)
    return NextResponse.json(
      { error: "Not oluşturulamadı" },
      { status: 500 }
    )
  }
}

