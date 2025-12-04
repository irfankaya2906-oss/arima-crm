import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const sector = searchParams.get("sector")
    const region = searchParams.get("region")
    const status = searchParams.get("status")
    const excludeStatus = searchParams.get("excludeStatus")
    const search = searchParams.get("search")

    const where: any = {}
    if (sector) where.sector = sector
    if (region) where.region = region
    if (excludeStatus) {
      where.status = { not: excludeStatus }
    } else if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        contacts: true,
        opportunities: true,
        meetings: true,
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Companies API error:", error)
    // Return empty array on error
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received company data:", body)
    
    // Validate required fields
    if (!body.companyName || body.companyName.trim() === "") {
      console.error("Validation failed: companyName is required")
      return NextResponse.json(
        { error: "Firma adı gereklidir" },
        { status: 400 }
      )
    }
    
    // Validate company name length
    if (body.companyName.trim().length > 200) {
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
    
    // Clean phone number (remove spaces, keep only digits and +)
    let phone = body.phone ? body.phone.trim() : null
    if (phone) {
      phone = phone.replace(/\s+/g, " ").trim()
    }
    
    // Clean website URL
    let website = body.website ? body.website.trim() : null
    if (website && !website.startsWith("http://") && !website.startsWith("https://")) {
      website = "https://" + website
    }
    
    console.log("Creating company with data:", {
      companyName: body.companyName.trim(),
      sector: body.sector?.trim() || null,
      region: body.region?.trim() || null,
      size: body.size?.trim() || null,
      website: website,
      phone: phone,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      status: body.status || "ADAY",
      description: body.description?.trim() || null,
    })
    
    const company = await prisma.company.create({
      data: {
        companyName: body.companyName.trim(),
        sector: body.sector?.trim() || null,
        region: body.region?.trim() || null,
        size: body.size?.trim() || null,
        website: website,
        phone: phone,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        status: body.status || "ADAY",
        description: body.description?.trim() || null,
      },
    })

    console.log("Company created successfully:", company.id)

    // Activity log (don't fail if this fails)
    try {
      if (company.id) {
        await prisma.activity.create({
          data: {
            companyId: company.id,
            activityType: "COMPANY_CREATED",
            description: `${company.companyName} firması oluşturuldu`,
          },
        })
        console.log("Activity log created")
      }
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
      // Continue even if activity log fails
    }

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("Create company error:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      name: error.name,
    })
    
    // Check for database connection errors
    let errorMessage = "Firma kaydedilemedi"
    
    // Prisma connection errors
    if (error.code === "P1000" || error.code === "P1001" || error.code === "P1017") {
      errorMessage = "Veritabanı bağlantı hatası! Lütfen .env dosyasında DATABASE_URL'i kontrol edin, PostgreSQL'in çalıştığından emin olun ve veritabanı kullanıcısının gerekli izinlere sahip olduğundan emin olun."
    } else if (error.message?.includes("denied access") || error.message?.includes("permission denied")) {
      errorMessage = "Veritabanı erişim hatası! Veritabanı kullanıcısının gerekli izinlere sahip olduğundan emin olun."
    } else if (error.code === "P2002") {
      // Unique constraint violation
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
    } else if (error.code === "P2011") {
      errorMessage = "Zorunlu alan eksik. Lütfen tüm zorunlu alanları doldurun."
    } else if (error.code === "P2025") {
      errorMessage = "Kayıt bulunamadı."
    } else if (error.code) {
      errorMessage = `Veritabanı hatası (${error.code}): ${error.message || "Bilinmeyen hata"}`
    } else if (error.message?.includes("Can't reach database server")) {
      errorMessage = "Veritabanı sunucusuna erişilemiyor! PostgreSQL'in çalıştığından emin olun."
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



