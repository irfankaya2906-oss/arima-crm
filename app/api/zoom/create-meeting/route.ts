import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, startTime, duration = 60, timezone = "Europe/Istanbul" } = body

    if (!topic) {
      return NextResponse.json(
        { error: "Toplantı konusu gereklidir" },
        { status: 400 }
      )
    }

    if (!startTime) {
      return NextResponse.json(
        { error: "Toplantı başlangıç zamanı gereklidir" },
        { status: 400 }
      )
    }

    // Zoom API credentials from environment
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID
    const zoomClientId = process.env.ZOOM_CLIENT_ID
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET

    if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
      return NextResponse.json(
        { 
          error: "Zoom API credentials eksik. Lütfen .env dosyasına ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID ve ZOOM_CLIENT_SECRET ekleyin.",
          details: "Zoom entegrasyonu için gerekli API bilgileri bulunamadı."
        },
        { status: 500 }
      )
    }

    // Get Zoom OAuth token
    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${zoomClientId}:${zoomClientSecret}`).toString("base64")}`,
        },
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error("Zoom token error:", errorData)
      return NextResponse.json(
        { 
          error: "Zoom API token alınamadı",
          details: errorData.error_description || "Zoom API kimlik doğrulama hatası"
        },
        { status: 500 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: "Zoom access token alınamadı" },
        { status: 500 }
      )
    }

    // Create Zoom meeting
    const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: new Date(startTime).toISOString(),
        duration: duration,
        timezone: timezone,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: false,
          watermark: false,
          use_pmi: false,
          approval_type: 0, // Automatically approve
          audio: "both", // Both telephony and VoIP
          auto_recording: "none",
        },
      }),
    })

    if (!meetingResponse.ok) {
      const errorData = await meetingResponse.json().catch(() => ({}))
      console.error("Zoom meeting creation error:", errorData)
      return NextResponse.json(
        { 
          error: "Zoom toplantısı oluşturulamadı",
          details: errorData.message || JSON.stringify(errorData)
        },
        { status: 500 }
      )
    }

    const meetingData = await meetingResponse.json()

    return NextResponse.json({
      success: true,
      meeting: {
        id: meetingData.id,
        topic: meetingData.topic,
        join_url: meetingData.join_url,
        start_url: meetingData.start_url,
        start_time: meetingData.start_time,
        duration: meetingData.duration,
        password: meetingData.password,
      },
    })
  } catch (error: any) {
    console.error("Zoom API error:", error)
    return NextResponse.json(
      {
        error: error.message || "Zoom toplantısı oluşturulurken bir hata oluştu",
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 }
    )
  }
}

