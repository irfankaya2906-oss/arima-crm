import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const oldOpportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    })

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: body,
      include: {
        company: true,
      },
    })

    // Activity log for stage change (don't fail if this fails)
    try {
      if (body.stage && oldOpportunity?.stage !== body.stage) {
        await prisma.activity.create({
          data: {
            companyId: opportunity.companyId,
            activityType: "OPPORTUNITY_STAGE_CHANGED",
            description: `${opportunity.title} fırsatı aşaması değiştirildi: ${oldOpportunity?.stage} → ${body.stage}`,
          },
        })
      }
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(opportunity)
  } catch (error: any) {
    console.error("Update opportunity error:", error)
    let errorMessage = error.message || "Failed to update opportunity"
    if (error.code === "P2025") {
      errorMessage = "Fırsat bulunamadı"
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

    await prisma.opportunity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete opportunity error:", error)
    let errorMessage = error.message || "Failed to delete opportunity"
    if (error.code === "P2025") {
      errorMessage = "Fırsat bulunamadı"
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



