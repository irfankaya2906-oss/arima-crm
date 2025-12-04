"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckSquare,
  Clock,
  User,
  Calendar,
  FileText,
  Paperclip,
  X,
  ExternalLink,
} from "lucide-react"
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils"
import { CompanyStatus, MeetingType, TaskStatus } from "@prisma/client"

const statusLabels: Record<CompanyStatus, string> = {
  ADAY: "Aday",
  MUSTERI: "Müşteri",
  SICAK: "Sıcak",
  SOGUK: "Soğuk",
  KAYBEDILDI: "Kaybedildi",
  KAZANILDI: "Kazanıldı",
}

const meetingTypeLabels: Record<MeetingType, string> = {
  TELEFON: "Telefon",
  ONLINE: "Online",
  YUZYUZE: "Yüz Yüze",
}

const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCompany()
    fetchNotes()
    fetchFiles()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch company")
      }
      const data = await response.json()
      setCompany(data)
    } catch (error) {
      console.error("Failed to fetch company:", error)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
      setNotes([])
    }
  }

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch files:", error)
      setFiles([])
    }
  }

  const handleUpdateStatus = async (status: CompanyStatus) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        fetchCompany()
        alert("Firma durumu güncellendi!")
      } else {
        alert(`Durum güncellenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Durum güncellenirken bir hata oluştu")
    }
  }

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId,
      fullName: formData.get("fullName") as string,
      position: formData.get("position") as string || null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      notes: formData.get("notes") as string || null,
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        setIsContactDialogOpen(false)
        fetchCompany()
        e.currentTarget.reset()
        alert("Yetkili başarıyla eklendi!")
      } else {
        alert(`Yetkili eklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to create contact:", error)
      alert("Yetkili eklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId,
      contactId: formData.get("contactId") || null,
      date: new Date(formData.get("date") as string).toISOString(),
      type: formData.get("type") as MeetingType,
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
        setIsMeetingDialogOpen(false)
        fetchCompany()
        e.currentTarget.reset()
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

  const handleCreateOpportunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId,
      title: formData.get("title") as string,
      value: parseFloat(formData.get("value") as string),
      probability: parseInt(formData.get("probability") as string) || 0,
      stage: formData.get("stage") || "YENI",
      nextAction: formData.get("nextAction") as string || null,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string).toISOString()
        : null,
      notes: formData.get("notes") as string || null,
    }

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        setIsOpportunityDialogOpen(false)
        fetchCompany()
        e.currentTarget.reset()
        alert("Fırsat başarıyla eklendi!")
      } else {
        alert(`Fırsat eklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to create opportunity:", error)
      alert("Fırsat eklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId,
      title: formData.get("title") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string).toISOString()
        : null,
      status: formData.get("status") || "TODO",
      notes: formData.get("notes") as string || null,
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        setIsTaskDialogOpen(false)
        fetchCompany()
        e.currentTarget.reset()
        alert("Görev başarıyla eklendi!")
      } else {
        alert(`Görev eklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      alert("Görev eklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string || null,
      content: formData.get("content") as string,
    }

    try {
      const response = await fetch(`/api/companies/${companyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        setIsNoteDialogOpen(false)
        fetchNotes()
        fetchCompany()
        try {
          e.currentTarget.reset()
        } catch (resetError) {}
        alert("Not başarıyla eklendi!")
      } else {
        alert(`Not eklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to create note:", error)
      alert("Not eklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const fileInput = formData.get("file") as File

    if (!fileInput || fileInput.size === 0) {
      alert("Lütfen bir dosya seçin")
      setIsSubmitting(false)
      return
    }

    // For now, we'll store file info. In production, upload to S3/Cloudinary/etc.
    const fileData = {
      companyId,
      fileName: fileInput.name,
      fileUrl: URL.createObjectURL(fileInput), // Temporary URL, should be uploaded to storage
      fileSize: fileInput.size,
      fileType: fileInput.type,
      description: formData.get("description") as string || null,
    }

    try {
      const formDataToSend = new FormData()
      Object.entries(fileData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value as string)
        }
      })

      const response = await fetch(`/api/companies/${companyId}/files`, {
        method: "POST",
        body: formDataToSend,
      })

      const responseData = await response.json()

      if (response.ok) {
        setIsFileDialogOpen(false)
        fetchFiles()
        fetchCompany()
        try {
          e.currentTarget.reset()
        } catch (resetError) {}
        alert("Dosya başarıyla yüklendi!")
      } else {
        alert(`Dosya yüklenemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
      alert("Dosya yüklenirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium">Yükleniyor...</p>
            <p className="text-sm text-gray-500 mt-2">Firma bilgileri getiriliyor</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Firma bulunamadı</p>
            <p className="text-sm text-gray-500 mt-2">Firma silinmiş veya erişim yetkiniz olmayabilir</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const whatsappLink = company.phone
    ? `https://wa.me/${company.phone.replace(/\D/g, "")}`
    : null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {company.companyName}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Select
                value={company.status}
                onValueChange={(value) =>
                  handleUpdateStatus(value as CompanyStatus)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            {whatsappLink && (
              <Button variant="outline" asChild>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            {company.email && (
              <Button variant="outline" asChild>
                <a href={`mailto:${company.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.sector && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Sektör:</span> {company.sector}
                  </span>
                </div>
              )}
              {company.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Bölge:</span> {company.region}
                  </span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${company.phone}`} className="text-sm hover:text-primary">
                    {company.phone}
                  </a>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${company.email}`} className="text-sm hover:text-primary">
                    {company.email}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-primary"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{company.address}</span>
                </div>
              )}
            </div>
            {company.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contacts">Yetkililer</TabsTrigger>
            <TabsTrigger value="meetings">Görüşmeler</TabsTrigger>
            <TabsTrigger value="opportunities">Satış Fırsatları</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="notes">Notlar</TabsTrigger>
            <TabsTrigger value="files">Dosyalar</TabsTrigger>
            <TabsTrigger value="activities">Aktivite Log</TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Yetkililer</CardTitle>
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Yetkili Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Yetkili Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateContact} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Ad Soyad *</Label>
                        <Input id="fullName" name="fullName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Pozisyon</Label>
                        <Input id="position" name="position" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" type="tel" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsContactDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {company.contacts?.length === 0 ? (
                  <p className="text-sm text-gray-500">Yetkili bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {company.contacts?.map((contact: any) => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="font-medium">{contact.fullName}</p>
                            {contact.position && (
                              <span className="text-sm text-gray-500">
                                - {contact.position}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            {contact.phone && (
                              <a href={`tel:${contact.phone}`} className="hover:text-primary">
                                {contact.phone}
                              </a>
                            )}
                            {contact.email && (
                              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                                {contact.email}
                              </a>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Görüşmeler</CardTitle>
                <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Görüşme Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Görüşme Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateMeeting} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Tarih *</Label>
                        <Input id="date" name="date" type="datetime-local" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tip</Label>
                        <Select name="type" defaultValue="TELEFON">
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
                      {company.contacts && company.contacts.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="contactId">Yetkili</Label>
                          <Select name="contactId">
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              {company.contacts.map((contact: any) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
                          onClick={() => setIsMeetingDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {company.meetings?.length === 0 ? (
                  <p className="text-sm text-gray-500">Görüşme bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {company.meetings?.map((meeting: any) => (
                      <div
                        key={meeting.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="font-medium">
                              {formatDateTime(meeting.date)}
                            </p>
                            <span className="text-sm text-gray-500">
                              - {meetingTypeLabels[meeting.type as MeetingType]}
                            </span>
                          </div>
                          {meeting.contact && (
                            <p className="text-sm text-gray-600 mb-1">
                              {meeting.contact.fullName}
                            </p>
                          )}
                          {meeting.summary && (
                            <p className="text-sm text-gray-600">{meeting.summary}</p>
                          )}
                          {meeting.nextStep && (
                            <p className="text-sm text-primary mt-2">
                              Sonraki adım: {meeting.nextStep}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Satış Fırsatları</CardTitle>
                <Dialog
                  open={isOpportunityDialogOpen}
                  onOpenChange={setIsOpportunityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Fırsat Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Satış Fırsatı</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateOpportunity} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Başlık *</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="value">Değer (TL) *</Label>
                          <Input
                            id="value"
                            name="value"
                            type="number"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="probability">Olasılık (%)</Label>
                          <Input
                            id="probability"
                            name="probability"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stage">Aşama</Label>
                        <Select name="stage" defaultValue="YENI">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YENI">Yeni</SelectItem>
                            <SelectItem value="NITELIKLI">Nitelikli</SelectItem>
                            <SelectItem value="DEMO">Demo</SelectItem>
                            <SelectItem value="TEKLIF">Teklif</SelectItem>
                            <SelectItem value="PAZARLIK">Pazarlık</SelectItem>
                            <SelectItem value="KAZANILDI">Kazanıldı</SelectItem>
                            <SelectItem value="KAYBEDILDI">Kaybedildi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Son Tarih</Label>
                        <Input id="dueDate" name="dueDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nextAction">Sonraki Aksiyon</Label>
                        <Input id="nextAction" name="nextAction" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsOpportunityDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {company.opportunities?.length === 0 ? (
                  <p className="text-sm text-gray-500">Fırsat bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {company.opportunities?.map((opp: any) => (
                      <div
                        key={opp.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <p className="font-medium">{opp.title}</p>
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(opp.value)}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Aşama: {opp.stage}</span>
                            <span>Olasılık: %{opp.probability}</span>
                            {opp.dueDate && (
                              <span>Son Tarih: {formatDate(opp.dueDate)}</span>
                            )}
                          </div>
                          {opp.notes && (
                            <p className="text-sm text-gray-500 mt-2">{opp.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Görevler</CardTitle>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Görev Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Görev Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Başlık *</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Son Tarih</Label>
                        <Input id="dueDate" name="dueDate" type="datetime-local" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Durum</Label>
                        <Select name="status" defaultValue="TODO">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(taskStatusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsTaskDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {company.tasks?.length === 0 ? (
                  <p className="text-sm text-gray-500">Görev bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {company.tasks?.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckSquare className="h-4 w-4 text-gray-400" />
                            <p className="font-medium">{task.title}</p>
                            <span className="text-sm text-gray-500">
                              - {taskStatusLabels[task.status as TaskStatus]}
                            </span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(task.dueDate)}
                            </div>
                          )}
                          {task.assignedTo && (
                            <p className="text-sm text-gray-500 mt-1">
                              Atanan: {task.assignedTo.name}
                            </p>
                          )}
                          {task.notes && (
                            <p className="text-sm text-gray-500 mt-2">{task.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notlar</CardTitle>
                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Not Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Not Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateNote} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="note-title">Başlık (Opsiyonel)</Label>
                        <Input id="note-title" name="title" placeholder="Not başlığı" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="note-content">İçerik *</Label>
                        <Textarea 
                          id="note-content" 
                          name="content" 
                          required 
                          rows={6}
                          placeholder="Not içeriğini buraya yazın..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsNoteDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500">Not bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note: any) => (
                      <div
                        key={note.id}
                        className="rounded-lg border p-4 hover:bg-gray-50"
                      >
                        {note.title && (
                          <h4 className="font-medium mb-2">{note.title}</h4>
                        )}
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatDateTime(note.createdAt)}</span>
                          {note.user && (
                            <>
                              <span>•</span>
                              <span>{note.user.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dosyalar</CardTitle>
                <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Dosya Yükle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dosya Yükle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUploadFile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Dosya *</Label>
                        <Input 
                          id="file" 
                          name="file" 
                          type="file" 
                          required
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500">
                          PDF, Word, Excel, resim dosyaları desteklenir
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="file-description">Açıklama (Opsiyonel)</Label>
                        <Textarea 
                          id="file-description" 
                          name="description" 
                          rows={3}
                          placeholder="Dosya hakkında not..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFileDialogOpen(false)}
                        >
                          İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Yükleniyor..." : "Yükle"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <p className="text-sm text-gray-500">Dosya bulunamadı</p>
                ) : (
                  <div className="space-y-3">
                    {files.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.fileName}</p>
                            {file.description && (
                              <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <span>{formatDateTime(file.createdAt)}</span>
                              {file.fileSize && (
                                <>
                                  <span>•</span>
                                  <span>{(file.fileSize / 1024).toFixed(2)} KB</span>
                                </>
                              )}
                              {file.user && (
                                <>
                                  <span>•</span>
                                  <span>{file.user.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Aktivite Log</CardTitle>
              </CardHeader>
              <CardContent>
                {company.activities?.length === 0 ? (
                  <p className="text-sm text-gray-500">Aktivite bulunamadı</p>
                ) : (
                  <div className="space-y-4">
                    {company.activities?.map((activity: any) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <div className="h-full w-px bg-gray-200"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatDateTime(activity.createdAt)}</span>
                            {activity.user && (
                              <>
                                <span>•</span>
                                <span>{activity.user.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


