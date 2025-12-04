import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {

    const opportunities = await prisma.opportunity.findMany({
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error("Opportunities API error:", error)
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
        { error: "Fırsat başlığı gereklidir" },
        { status: 400 }
      )
    }
    if (!body.companyId) {
      return NextResponse.json(
        { error: "Firma ID gereklidir" },
        { status: 400 }
      )
    }
    if (!body.value || isNaN(body.value) || body.value <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir değer giriniz" },
        { status: 400 }
      )
    }
    
    const opportunity = await prisma.opportunity.create({
      data: {
        companyId: body.companyId,
        title: body.title,
        value: parseFloat(body.value),
        probability: body.probability ? parseInt(body.probability) : 0,
        stage: body.stage || "YENI",
        nextAction: body.nextAction || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
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
          companyId: opportunity.companyId,
          activityType: "OPPORTUNITY_CREATED",
          description: `${opportunity.title} fırsatı oluşturuldu (${opportunity.value} TL)`,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
    }

    return NextResponse.json(opportunity)
  } catch (error: any) {
    console.error("Create opportunity error:", error)
    let errorMessage = error.message || "Failed to create opportunity"
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



