import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const files = await prisma.companyFile.findMany({
      where: { companyId: params.id },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(files)
  } catch (error: any) {
    console.error("Get files error:", error)
    return NextResponse.json(
      { error: "Dosyalar getirilemedi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const companyId = formData.get("companyId") as string
    const fileName = formData.get("fileName") as string
    const fileUrl = formData.get("fileUrl") as string
    const fileSize = formData.get("fileSize") ? parseInt(formData.get("fileSize") as string) : null
    const fileType = formData.get("fileType") as string || null
    const description = formData.get("description") as string || null
    const userId = formData.get("userId") as string || null

    if (!companyId || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Firma ID, dosya adı ve URL gereklidir" },
        { status: 400 }
      )
    }

    const file = await prisma.companyFile.create({
      data: {
        companyId,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        description,
        userId,
      },
    })

    // Activity log
    try {
      await prisma.activity.create({
        data: {
          companyId,
          activityType: "FILE_UPLOADED",
          description: `Dosya yüklendi: ${fileName}`,
          userId,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(file)
  } catch (error: any) {
    console.error("Create file error:", error)
    return NextResponse.json(
      { error: "Dosya kaydedilemedi" },
      { status: 500 }
    )
  }
}

