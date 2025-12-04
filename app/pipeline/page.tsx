"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { OpportunityStage } from "@prisma/client"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"

const stages: { id: OpportunityStage; label: string; color: string }[] = [
  { id: "YENI", label: "Yeni", color: "bg-gray-100" },
  { id: "NITELIKLI", label: "Nitelikli", color: "bg-blue-100" },
  { id: "DEMO", label: "Demo", color: "bg-yellow-100" },
  { id: "TEKLIF", label: "Teklif", color: "bg-orange-100" },
  { id: "PAZARLIK", label: "Pazarlık", color: "bg-purple-100" },
  { id: "KAZANILDI", label: "Kazanıldı", color: "bg-green-100" },
  { id: "KAYBEDILDI", label: "Kaybedildi", color: "bg-red-100" },
]

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formCompanyId, setFormCompanyId] = useState<string>("")

  useEffect(() => {
    fetchOpportunities()
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      setCompanies([])
    }
  }

  const fetchOpportunities = async () => {
    try {
      const response = await fetch("/api/opportunities")
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities")
      }
      const data = await response.json()
      // Ensure data is an array
      setOpportunities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch opportunities:", error)
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStage = destination.droppableId as OpportunityStage

    try {
      const response = await fetch(`/api/opportunities/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      const responseData = await response.json()

      if (response.ok) {
        fetchOpportunities()
      } else {
        console.error("Failed to update opportunity stage:", responseData)
        alert(`Aşama güncellenemedi: ${responseData.error || "Bilinmeyen hata"}`)
        fetchOpportunities() // Refresh to revert UI
      }
    } catch (error) {
      console.error("Failed to update opportunity stage:", error)
      alert("Aşama güncellenirken bir hata oluştu")
      fetchOpportunities() // Refresh to revert UI
    }
  }

  const handleCreateOpportunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
      const data = {
      companyId: formCompanyId || formData.get("companyId") as string,
      title: formData.get("title") as string,
      value: parseFloat(formData.get("value") as string),
      probability: parseInt(formData.get("probability") as string) || 0,
      stage: "YENI",
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
        setIsDialogOpen(false)
        setFormCompanyId("")
        fetchOpportunities()
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

  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    if (!Array.isArray(opportunities)) return []
    return opportunities.filter((opp) => opp && opp.stage === stage)
  }

  const getStageTotal = (stage: OpportunityStage) => {
    if (!Array.isArray(opportunities)) return 0
    return getOpportunitiesByStage(stage).reduce(
      (sum, opp) => sum + (opp?.value || 0),
      0
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium">Yükleniyor...</p>
            <p className="text-sm text-gray-500 mt-2">Fırsatlar getiriliyor</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Satış Hunisi</h1>
            <p className="text-gray-600 mt-1">Fırsatları aşamalar arasında taşıyın</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Fırsat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Satış Fırsatı</DialogTitle>
                <DialogDescription>
                  Fırsat bilgilerini doldurun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOpportunity} className="space-y-4">
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

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {stages.map((stage) => {
              const stageOpportunities = getOpportunitiesByStage(stage.id)
              const stageTotal = getStageTotal(stage.id)

              return (
                <Droppable key={stage.id} droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${stage.color} ${
                        snapshot.isDraggingOver ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">
                          {stage.label}
                        </CardTitle>
                        <p className="text-xs text-gray-600">
                          {Array.isArray(stageOpportunities) ? stageOpportunities.length : 0} fırsat
                        </p>
                        <p className="text-xs font-semibold text-primary">
                          {formatCurrency(stageTotal)}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2 min-h-[400px]">
                        {Array.isArray(stageOpportunities) && stageOpportunities.map((opp, index) => (
                          <Draggable
                            key={opp.id}
                            draggableId={opp.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white cursor-move ${
                                  snapshot.isDragging ? "shadow-lg" : ""
                                }`}
                              >
                                <CardContent className="pt-4">
                                  <div className="space-y-2">
                                    <p className="font-medium text-sm">
                                      {opp.title}
                                    </p>
                                    <p className="text-xs font-semibold text-primary">
                                      {formatCurrency(opp.value)}
                                    </p>
                                    {opp.company && (
                                      <p className="text-xs text-gray-500">
                                        {opp.company.companyName}
                                      </p>
                                    )}
                                    {opp && opp.probability > 0 && (
                                      <div className="flex items-center gap-1">
                                        <div className="flex-1 h-1 bg-gray-200 rounded-full">
                                          <div
                                            className="h-1 bg-primary rounded-full"
                                            style={{ width: `${opp.probability}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          %{opp.probability}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </DashboardLayout>
  )
}



