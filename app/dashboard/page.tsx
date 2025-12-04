"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Calendar, AlertTriangle, Clock, BarChart3, PieChart } from "lucide-react"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CompanyStatus } from "@prisma/client"

const statusLabels: Record<CompanyStatus, string> = {
  ADAY: "Aday",
  MUSTERI: "Müşteri",
  SICAK: "Sıcak",
  SOGUK: "Soğuk",
  KAYBEDILDI: "Kaybedildi",
  KAZANILDI: "Kazanıldı",
}

interface DashboardData {
  totalCompanies: number
  totalCustomers: number
  totalProspects: number
  companiesThisMonth: number
  monthlyOpportunityValue: number
  todayTasks: any[]
  upcomingMeetings: any[]
  recentActivities: any[]
  riskCompanies: any[]
}

interface StatsData {
  statusDistribution: { status: string; _count: { id: number } }[]
  monthlyGrowth: { month: string; count: number }[]
  stageDistribution: { stage: string; _count: { id: number }; _sum: { value: number | null } }[]
  monthlyOpportunityValues: { month: string; value: number }[]
  sectorDistribution: { sector: string; _count: { id: number } }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchStats()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      const dashboardData = await response.json()
      // Ensure all array fields are initialized
      setData({
        totalCompanies: dashboardData.totalCompanies || 0,
        totalCustomers: dashboardData.totalCustomers || 0,
        totalProspects: dashboardData.totalProspects || 0,
        companiesThisMonth: dashboardData.companiesThisMonth || 0,
        monthlyOpportunityValue: dashboardData.monthlyOpportunityValue || 0,
        todayTasks: dashboardData.todayTasks || [],
        upcomingMeetings: dashboardData.upcomingMeetings || [],
        recentActivities: dashboardData.recentActivities || [],
        riskCompanies: dashboardData.riskCompanies || [],
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      // Set default values on error
      setData({
        totalCompanies: 0,
        totalCustomers: 0,
        totalProspects: 0,
        companiesThisMonth: 0,
        monthlyOpportunityValue: 0,
        todayTasks: [],
        upcomingMeetings: [],
        recentActivities: [],
        riskCompanies: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Yükleniyor...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Veri yüklenemedi</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Genel bakış ve özet bilgiler</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCustomers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktif müşteri sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aday Firmalar</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProspects ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Müşteri olmayan firmalar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Eklenen</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.companiesThisMonth ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Yeni firma sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aylık Fırsat Değeri</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.monthlyOpportunityValue ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Bu ay oluşturulan fırsatlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü Görevler</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.todayTasks?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Tamamlanması gereken
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Companies */}
        {data.riskCompanies && data.riskCompanies.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="h-5 w-5" />
                Risk Uyarısı
              </CardTitle>
              <CardDescription className="text-orange-700">
                30+ gündür iletişim kurulmamış firmalar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.riskCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3"
                  >
                    <div>
                      <p className="font-medium">{company.companyName}</p>
                      <p className="text-sm text-gray-500">
                        Son iletişim:{" "}
                        {company.lastContactDate
                          ? formatDate(company.lastContactDate)
                          : "Hiç"}
                      </p>
                    </div>
                    <Link href={`/companies/${company.id}`}>
                      <Button variant="outline" size="sm">
                        Detay
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Bugünkü Görevler</CardTitle>
              <CardDescription>Tamamlanması gereken görevler</CardDescription>
            </CardHeader>
            <CardContent>
              {!data.todayTasks || data.todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bugün için görev yok
                </p>
              ) : (
                <div className="space-y-3">
                  {data.todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        {task.company && (
                          <p className="text-sm text-gray-500">
                            {task.company.companyName}
                          </p>
                        )}
                      </div>
                      {task.assignedTo && (
                        <div className="text-sm text-gray-500">
                          {task.assignedTo.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Toplantılar</CardTitle>
              <CardDescription>Önümüzdeki toplantılar</CardDescription>
            </CardHeader>
            <CardContent>
              {!data.upcomingMeetings || data.upcomingMeetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Yaklaşan toplantı yok
                </p>
              ) : (
                <div className="space-y-3">
                  {data.upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {formatDateTime(meeting.date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {meeting.company.companyName} - {meeting.type}
                        </p>
                        {meeting.contact && (
                          <p className="text-xs text-gray-400">
                            {meeting.contact.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Company Status Distribution */}
          {stats && stats.statusDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Firma Durumu Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.statusDistribution.map((item) => {
                    const total = stats.statusDistribution.reduce((sum, i) => sum + i._count.id, 0)
                    const percentage = total > 0 ? ((item._count.id / total) * 100).toFixed(1) : 0
                    return (
                      <div key={item.status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{statusLabels[item.status as keyof typeof statusLabels] || item.status}</span>
                          <span className="font-medium">{item._count.id} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Company Growth */}
          {stats && stats.monthlyGrowth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Aylık Firma Artışı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.monthlyGrowth.map((item) => {
                    const maxCount = Math.max(...stats.monthlyGrowth.map(m => m.count), 1)
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                    return (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-16">
                          {new Date(item.month + "-01").toLocaleDateString("tr-TR", { month: "short", year: "numeric" })}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all flex items-center justify-end pr-2"
                              style={{ width: `${height}%` }}
                            >
                              {item.count > 0 && (
                                <span className="text-xs text-white font-medium">{item.count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Timeline görünümü</CardDescription>
          </CardHeader>
          <CardContent>
            {!data.recentActivities || data.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aktivite yok</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="h-full w-px bg-gray-200"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">
                        {activity.company.companyName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
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
      </div>
    </DashboardLayout>
  )
}



