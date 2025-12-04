import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")

    const where: any = {}
    if (status) where.status = status
    if (assignedTo) where.assignedToId = assignedTo

    const tasks = await prisma.task.findMany({
      where,
      include: {
        company: true,
        assignedTo: true,
        createdBy: true,
      },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Tasks API error:", error)
    // Return empty array on error
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Görev başlığı gereklidir" },
        { status: 400 }
      )
    }
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        companyId: body.companyId || null,
        assignedToId: body.assignedToId || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "TODO",
        notes: body.notes || null,
      },
      include: {
        company: true,
        assignedTo: true,
      },
    })

    // Activity log (don't fail if this fails)
    try {
      if (task.companyId) {
        await prisma.activity.create({
          data: {
            companyId: task.companyId,
            activityType: "TASK_CREATED",
            description: `${task.title} görevi oluşturuldu`,
          },
        })
      }
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error("Create task error:", error)
    let errorMessage = error.message || "Failed to create task"
    if (error.code === "P2003") {
      errorMessage = "Geçersiz firma veya kullanıcı ID"
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



