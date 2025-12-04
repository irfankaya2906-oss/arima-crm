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
import { Plus, CheckSquare, Clock, Building2, User, Filter } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"
import { TaskStatus } from "@prisma/client"
import Link from "next/link"

const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
}

const taskStatusColors: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formCompanyId, setFormCompanyId] = useState<string>("none")
  const [formStatus, setFormStatus] = useState<TaskStatus>("TODO")

  useEffect(() => {
    fetchTasks()
    fetchCompanies()
  }, [statusFilter, dateFilter])

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (dateFilter === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        params.append("dueDate", today.toISOString())
      } else if (dateFilter === "tomorrow") {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        params.append("dueDate", tomorrow.toISOString())
      }

      const response = await fetch(`/api/tasks?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      // Ensure data is an array
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      setTasks([])
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

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      companyId: formCompanyId && formCompanyId !== "none" ? formCompanyId : null,
      title: formData.get("title") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string).toISOString()
        : null,
      status: formStatus || "TODO",
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
        setIsDialogOpen(false)
        setFormCompanyId("none")
        setFormStatus("TODO")
        fetchTasks()
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

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const responseData = await response.json()

      if (response.ok) {
        fetchTasks()
      } else {
        console.error("Failed to update task status:", responseData)
        alert(`Görev durumu güncellenemedi: ${responseData.error || "Bilinmeyen hata"}`)
        fetchTasks() // Refresh to revert UI
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      alert("Görev durumu güncellenirken bir hata oluştu")
      fetchTasks() // Refresh to revert UI
    }
  }

  const getTodayTasks = () => {
    if (!Array.isArray(tasks)) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter((task) => {
      if (!task || !task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= today && taskDate < tomorrow && task.status !== "COMPLETED"
    })
  }

  const getOverdueTasks = () => {
    if (!Array.isArray(tasks)) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (!task || !task.dueDate || task.status === "COMPLETED") return false
      const taskDate = new Date(task.dueDate)
      return taskDate < today
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium">Yükleniyor...</p>
            <p className="text-sm text-gray-500 mt-2">Görevler getiriliyor</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const todayTasks = getTodayTasks()
  const overdueTasks = getOverdueTasks()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
            <p className="text-gray-600 mt-1">Görev yönetimi ve takibi</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Görev
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Görev Ekle</DialogTitle>
                <DialogDescription>
                  Görev bilgilerini doldurun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Firma</Label>
                  <Select value={formCompanyId} onValueChange={setFormCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Firma seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Firma yok</SelectItem>
                      {Array.isArray(companies) && companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Son Tarih</Label>
                  <Input id="dueDate" name="dueDate" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select value={formStatus} onValueChange={(value) => setFormStatus(value as TaskStatus)}>
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
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormCompanyId("none")
                      setFormStatus("TODO")
                    }}
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(taskStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tarih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="tomorrow">Yarın</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        {Array.isArray(overdueTasks) && overdueTasks.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Geciken Görevler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between rounded-lg border bg-white p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.company && (
                        <Link
                          href={`/companies/${task.companyId}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <Building2 className="h-3 w-3" />
                          {task.company.companyName}
                        </Link>
                      )}
                      {task.dueDate && (
                        <p className="text-sm text-red-600 mt-1">
                          Son tarih: {formatDateTime(task.dueDate)}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")}
                    >
                      Tamamla
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        {Array.isArray(todayTasks) && todayTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Bugünkü Görevler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{task.title}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColors[task.status as TaskStatus]}`}
                        >
                          {taskStatusLabels[task.status as TaskStatus]}
                        </span>
                      </div>
                      {task.company && (
                        <Link
                          href={`/companies/${task.companyId}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Building2 className="h-3 w-3" />
                          {task.company.companyName}
                        </Link>
                      )}
                      {task.assignedTo && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo.name}
                        </p>
                      )}
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-2">{task.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {task.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateTaskStatus(task.id, "COMPLETED")
                          }
                        >
                          Tamamla
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(tasks) || tasks.length === 0 ? (
              <p className="text-sm text-gray-500">Görev bulunamadı</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{task.title}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColors[task.status as TaskStatus]}`}
                        >
                          {taskStatusLabels[task.status as TaskStatus]}
                        </span>
                      </div>
                      {task.company && (
                        <Link
                          href={`/companies/${task.companyId}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Building2 className="h-3 w-3" />
                          {task.company.companyName}
                        </Link>
                      )}
                      {task.dueDate && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(task.dueDate)}
                        </p>
                      )}
                      {task.assignedTo && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo.name}
                        </p>
                      )}
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-2">{task.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {task.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateTaskStatus(task.id, "COMPLETED")
                          }
                        >
                          Tamamla
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


