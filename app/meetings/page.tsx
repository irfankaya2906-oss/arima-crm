"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calendar, Phone, Video, Users, Building2, LucideIcon, ExternalLink } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"
import { MeetingType } from "@prisma/client"

const meetingTypeLabels: Record<MeetingType, string> = {
  TELEFON: "Telefon",
  ONLINE: "Online",
  YUZYUZE: "Yüz Yüze",
}

const meetingTypeIcons: Record<MeetingType, LucideIcon> = {
  TELEFON: Phone,
  ONLINE: Video,
  YUZYUZE: Users,
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formCompanyId, setFormCompanyId] = useState<string>("")
  const [formType, setFormType] = useState<MeetingType>("TELEFON")
  const [isCreatingZoom, setIsCreatingZoom] = useState(false)

  useEffect(() => {
    fetchMeetings()
    fetchCompanies()
  }, [])

  const fetchMeetings = async () => {
    try {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const response = await fetch(
        `/api/meetings?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch meetings")
      }
      const data = await response.json()
      // Ensure data is an array
      setMeetings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch meetings:", error)
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      // Ensure data is an array
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      setCompanies([])
    }
  }

  const handleCreateZoomMeeting = async (formData: FormData) => {
    if (isCreatingZoom) return
    
    setIsCreatingZoom(true)
    const companyId = formCompanyId || formData.get("companyId") as string
    const date = formData.get("date") as string
    
    if (!companyId || !date) {
      alert("Firma ve tarih seçilmelidir")
      setIsCreatingZoom(false)
      return
    }

    const company = companies.find(c => c.id === companyId)
    const companyName = company?.companyName || "Toplantı"
    const topic = `${companyName} - ${formatDateTime(new Date(date))}`

    try {
      const zoomResponse = await fetch("/api/zoom/create-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          startTime: new Date(date).toISOString(),
          duration: 60,
        }),
      })

      const zoomData = await zoomResponse.json()

      if (zoomResponse.ok && zoomData.success) {
        // Create meeting with Zoom data
        const meetingData = {
          companyId,
          contactId: formData.get("contactId") || null,
          date: new Date(date).toISOString(),
          type: "ONLINE" as MeetingType,
          summary: formData.get("summary") as string || null,
          nextStep: formData.get("nextStep") as string || null,
          zoomMeetingId: zoomData.meeting.id.toString(),
          zoomJoinUrl: zoomData.meeting.join_url,
          zoomStartUrl: zoomData.meeting.start_url,
          zoomPassword: zoomData.meeting.password || null,
        }

        const response = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(meetingData),
        })

        const responseData = await response.json()

        if (response.ok) {
          setIsDialogOpen(false)
          setFormCompanyId("")
          setFormType("TELEFON")
          fetchMeetings()
          alert(`Zoom toplantısı başarıyla oluşturuldu!\n\nKatılım Linki: ${zoomData.meeting.join_url}\nŞifre: ${zoomData.meeting.password || "Yok"}`)
        } else {
          alert(`Toplantı kaydedilemedi: ${responseData.error || "Bilinmeyen hata"}`)
        }
      } else {
        alert(`Zoom toplantısı oluşturulamadı: ${zoomData.error || "Bilinmeyen hata"}\n\n${zoomData.details || ""}`)
      }
    } catch (error) {
      console.error("Failed to create Zoom meeting:", error)
      alert("Zoom toplantısı oluşturulurken bir hata oluştu")
    } finally {
      setIsCreatingZoom(false)
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId: formCompanyId || formData.get("companyId") as string,
      contactId: formData.get("contactId") || null,
      date: new Date(formData.get("date") as string).toISOString(),
      type: formType || (formData.get("type") as MeetingType),
      summary: formData.get("summary") as string || null,
      nextStep: formData.get("nextStep") as string || null,
    }

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        setIsDialogOpen(false)
        setFormCompanyId("")
        setFormType("TELEFON")
        fetchMeetings()
        try {
          e.currentTarget.reset()
        } catch (resetError) {
          // Form might already be unmounted
        }
        alert("Toplantı başarıyla eklendi!")
      } else {
        alert(`Toplantı eklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to create meeting:", error)
      alert("Toplantı eklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTodayMeetings = () => {
    if (!Array.isArray(meetings)) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return meetings.filter((meeting) => {
      if (!meeting || !meeting.date) return false
      const meetingDate = new Date(meeting.date)
      return meetingDate >= today && meetingDate < tomorrow
    })
  }

  const getUpcomingMeetings = () => {
    if (!Array.isArray(meetings)) return []
    const now = new Date()
    return meetings
      .filter((meeting) => meeting && meeting.date && new Date(meeting.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium">Yükleniyor...</p>
            <p className="text-sm text-gray-500 mt-2">Toplantılar getiriliyor</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const todayMeetings = getTodayMeetings()
  const upcomingMeetings = getUpcomingMeetings()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Toplantılar</h1>
            <p className="text-gray-600 mt-1">Toplantı takvimi ve yönetimi</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
            >
              Haftalık
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => setViewMode("month")}
            >
              Aylık
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Toplantı
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Toplantı Ekle</DialogTitle>
                  <DialogDescription>
                    Toplantı bilgilerini doldurun
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyId">Firma *</Label>
                    <Select value={formCompanyId} onValueChange={setFormCompanyId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Firma seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(companies) && companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tarih ve Saat *</Label>
                    <Input id="date" name="date" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tip</Label>
                    <Select value={formType} onValueChange={(value) => setFormType(value as MeetingType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(meetingTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Özet</Label>
                    <Textarea id="summary" name="summary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextStep">Sonraki Adım</Label>
                    <Input id="nextStep" name="nextStep" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault()
                        const form = e.currentTarget.closest("form")
                        if (form) {
                          const formData = new FormData(form as HTMLFormElement)
                          handleCreateZoomMeeting(formData)
                        }
                      }}
                      disabled={isCreatingZoom || isSubmitting || !formCompanyId}
                    >
                      {isCreatingZoom ? "Zoom Oluşturuluyor..." : "Zoom Toplantısı Oluştur"}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isCreatingZoom}>
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Today's Meetings */}
        {Array.isArray(todayMeetings) && todayMeetings.length > 0 && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Bugün Yapılacak Toplantılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayMeetings.map((meeting) => {
                  const Icon = meetingTypeIcons[meeting.type as MeetingType]
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-4 rounded-lg border bg-white p-4"
                    >
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{formatDateTime(meeting.date)}</p>
                        <p className="text-sm text-gray-600">
                          {meeting.company.companyName} - {meetingTypeLabels[meeting.type as MeetingType]}
                        </p>
                        {meeting.contact && (
                          <p className="text-xs text-gray-500 mt-1">
                            {meeting.contact.fullName}
                          </p>
                        )}
                        {meeting.zoomJoinUrl && (
                          <div className="mt-2">
                            <a
                              href={meeting.zoomJoinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Video className="h-4 w-4" />
                              Zoom'a Katıl
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {meeting.zoomPassword && (
                              <p className="text-xs text-gray-500 mt-1">
                                Şifre: {meeting.zoomPassword}
                              </p>
                            )}
                          </div>
                        )}
                        {meeting.summary && (
                          <p className="text-sm text-gray-600 mt-2">{meeting.summary}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan Toplantılar</CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(upcomingMeetings) || upcomingMeetings.length === 0 ? (
              <p className="text-sm text-gray-500">Yaklaşan toplantı yok</p>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => {
                  const Icon = meetingTypeIcons[meeting.type as MeetingType]
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-4 rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{formatDateTime(meeting.date)}</p>
                          <span className="text-xs text-gray-500">
                            {meetingTypeLabels[meeting.type as MeetingType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <a
                            href={`/companies/${meeting.companyId}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {meeting.company.companyName}
                          </a>
                        </div>
                        {meeting.contact && (
                          <p className="text-sm text-gray-600">
                            {meeting.contact.fullName}
                          </p>
                        )}
                        {meeting.summary && (
                          <p className="text-sm text-gray-500 mt-2">{meeting.summary}</p>
                        )}
                        {meeting.nextStep && (
                          <p className="text-sm text-primary mt-2">
                            Sonraki adım: {meeting.nextStep}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


