import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
        opportunities: true,
        meetings: {
          include: { contact: true, createdBy: true },
          orderBy: { date: "desc" },
        },
        tasks: {
          include: { assignedTo: true },
          orderBy: { dueDate: "asc" },
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("Get company error:", error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch company",
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (body.companyName !== undefined && (!body.companyName || body.companyName.trim() === "")) {
      return NextResponse.json(
        { error: "Firma adı gereklidir" },
        { status: 400 }
      )
    }
    
    // Validate company name length
    if (body.companyName && body.companyName.trim().length > 200) {
      return NextResponse.json(
        { error: "Firma adı çok uzun (maksimum 200 karakter)" },
        { status: 400 }
      )
    }
    
    // Validate email format if provided
    if (body.email && body.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: "Geçersiz email formatı" },
          { status: 400 }
        )
      }
    }
    
    // Validate website format if provided
    if (body.website && body.website.trim() !== "") {
      let website = body.website.trim()
      if (!website.startsWith("http://") && !website.startsWith("https://")) {
        website = "https://" + website
      }
      try {
        new URL(website)
      } catch {
        return NextResponse.json(
          { error: "Geçersiz website formatı" },
          { status: 400 }
        )
      }
    }
    
    // Clean phone number
    let phone = body.phone !== undefined ? (body.phone ? body.phone.trim() : null) : undefined
    if (phone) {
      phone = phone.replace(/\s+/g, " ").trim()
    }
    
    // Clean website URL
    let website = body.website !== undefined ? (body.website ? body.website.trim() : null) : undefined
    if (website && !website.startsWith("http://") && !website.startsWith("https://")) {
      website = "https://" + website
    }
    
    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        companyName: body.companyName ? body.companyName.trim() : undefined,
        sector: body.sector !== undefined ? (body.sector ? body.sector.trim() : null) : undefined,
        region: body.region !== undefined ? (body.region ? body.region.trim() : null) : undefined,
        size: body.size !== undefined ? (body.size ? body.size.trim() : null) : undefined,
        website: website,
        phone: phone,
        email: body.email !== undefined ? (body.email ? body.email.trim() : null) : undefined,
        address: body.address !== undefined ? (body.address ? body.address.trim() : null) : undefined,
        status: body.status,
        description: body.description !== undefined ? (body.description ? body.description.trim() : null) : undefined,
      },
    })

    // Activity log (don't fail if this fails)
    try {
      await prisma.activity.create({
        data: {
          companyId: company.id,
          activityType: "COMPANY_UPDATED",
          description: `${company.companyName} firması güncellendi`,
        },
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
      // Continue even if activity log fails
    }

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("Update company error:", error)
    let errorMessage = "Firma güncellenemedi"
    
    if (error.code === "P2025") {
      errorMessage = "Firma bulunamadı"
    } else if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "alan"
      if (field === "companyName") {
        errorMessage = "Bu firma adı zaten kullanılıyor. Lütfen farklı bir firma adı girin."
      } else if (field === "email") {
        errorMessage = "Bu email adresi zaten kullanılıyor. Lütfen farklı bir email girin."
      } else {
        errorMessage = `Bu ${field} değeri zaten kullanılıyor.`
      }
    } else if (error.code === "P2003") {
      errorMessage = "Geçersiz veri hatası. Lütfen tüm alanları kontrol edin."
    } else if (error.code === "P1000" || error.code === "P1001" || error.code === "P1017") {
      errorMessage = "Veritabanı bağlantı hatası! Lütfen .env dosyasında DATABASE_URL'i kontrol edin."
    } else if (error.message?.includes("denied access") || error.message?.includes("permission denied")) {
      errorMessage = "Veritabanı erişim hatası! Veritabanı kullanıcısının gerekli izinlere sahip olduğundan emin olun."
    } else if (error.message) {
      errorMessage = error.message
    }
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          message: error.message,
          code: error.code,
          name: error.name,
        } : undefined
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

    await prisma.company.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete company error:", error)
    let errorMessage = error.message || "Failed to delete company"
    if (error.code === "P2025") {
      errorMessage = "Firma bulunamadı"
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



