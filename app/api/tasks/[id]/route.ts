import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const oldTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    const task = await prisma.task.update({
      where: { id: params.id },
      data: body,
      include: {
        company: true,
        assignedTo: true,
      },
    })

    // Activity log for completion (don't fail if this fails)
    try {
      if (body.status === "COMPLETED" && oldTask?.status !== "COMPLETED" && task.companyId) {
        await prisma.activity.create({
          data: {
            companyId: task.companyId,
            activityType: "TASK_COMPLETED",
            description: `${task.title} görevi tamamlandı`,
          },
        })
      }
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error("Update task error:", error)
    let errorMessage = error.message || "Failed to update task"
    if (error.code === "P2025") {
      errorMessage = "Görev bulunamadı"
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete task error:", error)
    let errorMessage = error.message || "Failed to delete task"
    if (error.code === "P2025") {
      errorMessage = "Görev bulunamadı"
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



