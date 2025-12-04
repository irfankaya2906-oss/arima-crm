import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role } = body

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Ad soyad gereklidir" },
        { status: 400 }
      )
    }

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Email gereklidir" },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        phone: phone?.trim() || null,
        role: role || "SALES",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla kaydedildi",
        user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Register error:", error)
    let errorMessage = error.message || "Kullanıcı kaydedilemedi"
    
    if (error.code === "P2002") {
      errorMessage = "Bu email adresi zaten kullanılıyor"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 }
    )
  }
}

