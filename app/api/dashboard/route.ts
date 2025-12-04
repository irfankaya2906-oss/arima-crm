import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"

export async function GET() {
  try {

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const dayStart = startOfDay(now)
    const dayEnd = endOfDay(now)

    // Total companies
    const totalCompanies = await prisma.company.count()

    // Total customers (MUSTERI status)
    const totalCustomers = await prisma.company.count({
      where: { status: "MUSTERI" },
    })

    // Total prospects (non-MUSTERI companies)
    const totalProspects = await prisma.company.count({
      where: { status: { not: "MUSTERI" } },
    })

    // Companies added this month
    const companiesThisMonth = await prisma.company.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    // Monthly opportunity value
    const opportunities = await prisma.opportunity.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })
    const monthlyOpportunityValue = opportunities.reduce(
      (sum, opp) => sum + opp.value,
      0
    )

    // Today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        company: true,
        assignedTo: true,
      },
    })

    // Upcoming meetings
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        date: {
          gte: dayStart,
        },
      },
      take: 5,
      include: {
        company: true,
        contact: true,
      },
      orderBy: { date: "asc" },
    })

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      include: {
        user: true,
        company: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Risk companies (no contact for 30+ days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const riskCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { lastContactDate: null },
          { lastContactDate: { lt: thirtyDaysAgo } },
        ],
        status: {
          notIn: ["KAYBEDILDI", "KAZANILDI"],
        },
      },
      take: 5,
    })

    return NextResponse.json({
      totalCompanies,
      totalCustomers,
      totalProspects,
      companiesThisMonth,
      monthlyOpportunityValue,
      todayTasks,
      upcomingMeetings,
      recentActivities,
      riskCompanies,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    // Return default values on error
    return NextResponse.json({
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
  }
}



