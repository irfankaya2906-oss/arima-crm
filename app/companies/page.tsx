"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Building2, Mail, Phone, ExternalLink, Edit, Trash2, Download, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Company, CompanyStatus } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusLabels: Record<CompanyStatus, string> = {
  ADAY: "Aday",
  MUSTERI: "Müşteri",
  SICAK: "Sıcak",
  SOGUK: "Soğuk",
  KAYBEDILDI: "Kaybedildi",
  KAZANILDI: "Kazanıldı",
}

const statusColors: Record<CompanyStatus, string> = {
  ADAY: "bg-gray-100 text-gray-800",
  MUSTERI: "bg-green-100 text-green-800",
  SICAK: "bg-red-100 text-red-800",
  SOGUK: "bg-blue-100 text-blue-800",
  KAYBEDILDI: "bg-gray-200 text-gray-600",
  KAZANILDI: "bg-emerald-100 text-emerald-800",
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"all" | "customers" | "prospects">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formStatus, setFormStatus] = useState<string>("ADAY")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [search, sectorFilter, regionFilter, statusFilter])

  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (sectorFilter && sectorFilter !== "all") params.append("sector", sectorFilter)
      if (regionFilter && regionFilter !== "all") params.append("region", regionFilter)
      
      // Apply status filter based on active tab
      if (activeTab === "customers") {
        params.append("status", "MUSTERI")
      } else if (activeTab === "prospects") {
        params.append("status", "ADAY")
      } else if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/companies?${params.toString()}`)
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [search, sectorFilter, regionFilter, statusFilter, activeTab])

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isSubmitting) return // Prevent double submission
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // Convert empty strings to null for optional fields
    const getValue = (key: string) => {
      const value = formData.get(key) as string
      return value && value.trim() !== "" ? value : null
    }
    
    const data = {
      companyName: formData.get("companyName") as string,
      sector: getValue("sector"),
      region: getValue("region"),
      size: getValue("size"),
      website: getValue("website"),
      phone: getValue("phone"),
      email: getValue("email"),
      address: getValue("address"),
      status: (formStatus as CompanyStatus) || "ADAY",
      description: getValue("description"),
    }

    console.log("Submitting company data:", data)

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()
      console.log("Response:", response.status, responseData)
      console.log("Response data details:", JSON.stringify(responseData, null, 2))

      if (response.ok) {
        // Reset form before closing dialog
        e.currentTarget.reset()
        setFormStatus("ADAY") // Reset form status
        setIsDialogOpen(false)
        await fetchCompanies()
        // Show success message
        alert("✅ Firma başarıyla kaydedildi!")
      } else {
        console.error("Failed to create company:", responseData)
        let errorMessage = responseData.error || "Bilinmeyen hata"
        
        // Daha açıklayıcı hata mesajları
        if (errorMessage.includes("denied access") || errorMessage.includes("bağlantı hatası") || errorMessage.includes("Veritabanı")) {
          errorMessage = "Veritabanı bağlantı hatası!\n\n" +
            "Çözüm:\n" +
            "1. .env dosyasında DATABASE_URL'i kontrol edin\n" +
            "2. PostgreSQL'in çalıştığından emin olun\n" +
            "3. Veritabanı kullanıcısının gerekli izinlere sahip olduğundan emin olun\n\n" +
            "Hızlı çözüm: Terminal'de './setup-database.sh' komutunu çalıştırın"
        } else if (response.status === 400) {
          // Validation error - show user-friendly message
          errorMessage = `❌ ${errorMessage}\n\nLütfen formu kontrol edip tekrar deneyin.`
        } else if (response.status === 500) {
          errorMessage = `❌ Sunucu hatası: ${errorMessage}\n\nLütfen daha sonra tekrar deneyin.`
        }
        
        alert(`Firma kaydedilemedi (Hata ${response.status}):\n\n${errorMessage}`)
      }
    } catch (error) {
      console.error("Failed to create company:", error)
      let errorMessage = "Bilinmeyen hata"
      
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Sunucuya bağlanılamadı! Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`❌ Firma kaydedilirken bir hata oluştu:\n\n${errorMessage}\n\nLütfen tekrar deneyin.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setFormStatus(company.status)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isSubmitting || !editingCompany) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // Convert empty strings to null for optional fields
    const getValue = (key: string) => {
      const value = formData.get(key) as string
      return value && value.trim() !== "" ? value : null
    }
    
    const data = {
      companyName: formData.get("companyName") as string,
      sector: getValue("sector"),
      region: getValue("region"),
      size: getValue("size"),
      website: getValue("website"),
      phone: getValue("phone"),
      email: getValue("email"),
      address: getValue("address"),
      status: (formStatus as CompanyStatus) || editingCompany.status,
      description: getValue("description"),
    }

    console.log("Updating company:", editingCompany.id, data)

    try {
      const response = await fetch(`/api/companies/${editingCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()
      console.log("Update response:", response.status, responseData)

      if (response.ok) {
        // Reset form before closing dialog
        try {
          e.currentTarget.reset()
        } catch (resetError) {
          // Form might already be unmounted, ignore error
          console.log("Form reset skipped (already unmounted)")
        }
        setFormStatus("ADAY")
        setEditingCompany(null)
        setIsEditDialogOpen(false)
        await fetchCompanies()
        alert("✅ Firma başarıyla güncellendi!")
      } else {
        let errorMessage = responseData.error || "Bilinmeyen hata"
        console.error("Failed to update company:", responseData)
        
        // Daha açıklayıcı hata mesajları
        if (errorMessage.includes("denied access") || errorMessage.includes("bağlantı hatası") || errorMessage.includes("Veritabanı")) {
          errorMessage = "Veritabanı bağlantı hatası!\n\n" +
            "Çözüm:\n" +
            "1. .env dosyasında DATABASE_URL'i kontrol edin\n" +
            "2. PostgreSQL'in çalıştığından emin olun\n" +
            "3. Veritabanı kullanıcısının gerekli izinlere sahip olduğundan emin olun"
        } else if (response.status === 400) {
          errorMessage = `❌ ${errorMessage}\n\nLütfen formu kontrol edip tekrar deneyin.`
        } else if (response.status === 500) {
          errorMessage = `❌ Sunucu hatası: ${errorMessage}\n\nLütfen daha sonra tekrar deneyin.`
        }
        
        alert(`Firma güncellenemedi (Hata ${response.status}):\n\n${errorMessage}`)
      }
    } catch (error) {
      console.error("Failed to update company:", error)
      let errorMessage = "Bilinmeyen hata"
      
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Sunucuya bağlanılamadı! Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`❌ Firma güncellenirken bir hata oluştu:\n\n${errorMessage}\n\nLütfen tekrar deneyin.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`${companyName} firmasını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      })

      const responseData = await response.json()

      if (response.ok) {
        fetchCompanies()
        alert("Firma başarıyla silindi!")
      } else {
        alert(`Firma silinemedi: ${responseData.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Failed to delete company:", error)
      alert("Firma silinirken bir hata oluştu")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCompanies = () => {
    const headers = ["Firma Adı", "Sektör", "Bölge", "Büyüklük", "Telefon", "Email", "Website", "Adres", "Durum", "Son İletişim", "Oluşturulma"]
    const rows = companies.map(company => [
      company.companyName || "",
      company.sector || "",
      company.region || "",
      company.size || "",
      company.phone || "",
      company.email || "",
      company.website || "",
      company.address || "",
      statusLabels[company.status] || "",
      company.lastContactDate ? formatDate(company.lastContactDate) : "",
      company.createdAt ? formatDate(company.createdAt) : "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `firmalar_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getUniqueValues = (key: keyof Company) => {
    const values = companies
      .map((c) => c[key])
      .filter((v): v is string => v !== null && v !== undefined)
    return Array.from(new Set(values))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium">Yükleniyor...</p>
            <p className="text-sm text-gray-500 mt-2">Firmalar getiriliyor</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Firmalar</h1>
            <p className="text-gray-600 mt-1">Firma listesi ve yönetimi</p>
          </div>
          <div className="flex gap-2">
            {companies.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExportCompanies}
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export (CSV)
              </Button>
            )}
            <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setFormStatus("ADAY") // Reset form when dialog closes
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Firma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Firma Ekle</DialogTitle>
                <DialogDescription>
                  Firma bilgilerini doldurun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firma Adı *</Label>
                    <Input id="companyName" name="companyName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sektör</Label>
                    <Input id="sector" name="sector" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Bölge</Label>
                    <Input id="region" name="region" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Büyüklük</Label>
                    <Input id="size" name="size" />
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
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea id="address" name="address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
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
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Firma ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sektör" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {getUniqueValues("sector").map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Bölge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {getUniqueValues("region").map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Customers and Prospects */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "customers" | "prospects")}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="customers">Müşteriler</TabsTrigger>
            <TabsTrigger value="prospects">Aday Firmalar</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <CompaniesList companies={companies} loading={loading} onEdit={handleEditCompany} onDelete={handleDeleteCompany} isDeleting={isDeleting} />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <CompaniesList companies={companies} loading={loading} onEdit={handleEditCompany} onDelete={handleDeleteCompany} isDeleting={isDeleting} />
          </TabsContent>

          <TabsContent value="prospects" className="mt-6">
            <CompaniesList companies={companies} loading={loading} onEdit={handleEditCompany} onDelete={handleDeleteCompany} isDeleting={isDeleting} />
          </TabsContent>
        </Tabs>

        {/* Edit Company Dialog */}
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingCompany(null)
              setFormStatus("ADAY")
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Firmayı Düzenle</DialogTitle>
              <DialogDescription>
                Firma bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            {editingCompany && (
              <form onSubmit={handleUpdateCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-companyName">Firma Adı *</Label>
                    <Input 
                      id="edit-companyName" 
                      name="companyName" 
                      defaultValue={editingCompany.companyName}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Durum</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-sector">Sektör</Label>
                    <Input 
                      id="edit-sector" 
                      name="sector" 
                      defaultValue={editingCompany.sector || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-region">Bölge</Label>
                    <Input 
                      id="edit-region" 
                      name="region" 
                      defaultValue={editingCompany.region || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-size">Büyüklük</Label>
                    <Input 
                      id="edit-size" 
                      name="size" 
                      defaultValue={editingCompany.size || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefon</Label>
                    <Input 
                      id="edit-phone" 
                      name="phone" 
                      type="tel" 
                      defaultValue={editingCompany.phone || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input 
                      id="edit-email" 
                      name="email" 
                      type="email" 
                      defaultValue={editingCompany.email || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input 
                      id="edit-website" 
                      name="website" 
                      type="url" 
                      defaultValue={editingCompany.website || ""} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Adres</Label>
                  <Textarea 
                    id="edit-address" 
                    name="address" 
                    defaultValue={editingCompany.address || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Açıklama</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingCompany.description || ""} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingCompany(null)
                      setFormStatus("ADAY")
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Companies List Component
function CompaniesList({ 
  companies, 
  loading, 
  onEdit, 
  onDelete, 
  isDeleting 
}: { 
  companies: Company[]
  loading: boolean
  onEdit: (company: Company) => void
  onDelete: (id: string, name: string) => void
  isDeleting: boolean
}) {
  return (
    <div className="grid gap-4">
      {companies.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Firma bulunamadı</p>
          </CardContent>
        </Card>
      ) : (
        companies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <Link
                      href={`/companies/${company.id}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {company.companyName}
                    </Link>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[company.status]}`}
                    >
                      {statusLabels[company.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                    {company.sector && (
                      <div>
                        <span className="font-medium">Sektör:</span> {company.sector}
                      </div>
                    )}
                    {company.region && (
                      <div>
                        <span className="font-medium">Bölge:</span> {company.region}
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${company.phone}`}
                          className="hover:text-primary"
                        >
                          {company.phone}
                        </a>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${company.email}`}
                          className="hover:text-primary"
                        >
                          {company.email}
                        </a>
                      </div>
                    )}
                  </div>
                  {company.lastContactDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Son iletişim: {formatDate(company.lastContactDate)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {company.email && (
                    <a href={`mailto:${company.email}`}>
                      <Button variant="outline" size="sm" title="Email Gönder">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {company.phone && (
                    <a href={`tel:${company.phone}`}>
                      <Button variant="outline" size="sm" title="Ara">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {company.phone && (
                    <a 
                      href={`https://wa.me/${company.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" title="WhatsApp">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(company)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </Button>
                  <Link href={`/companies/${company.id}`}>
                    <Button variant="outline" size="sm">
                      Detay
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(company.id, company.companyName)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

