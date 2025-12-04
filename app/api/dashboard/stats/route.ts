import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET() {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Company status distribution
    const statusDistribution = await prisma.company.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    })

    // Monthly company growth (last 6 months)
    const monthlyGrowth = []
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i)
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const count = await prisma.company.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })
      
      monthlyGrowth.push({
        month: month.toISOString().substring(0, 7),
        count,
      })
    }

    // Opportunity stage distribution
    const stageDistribution = await prisma.opportunity.groupBy({
      by: ["stage"],
      _count: {
        id: true,
      },
      _sum: {
        value: true,
      },
    })

    // Monthly opportunity value (last 6 months)
    const monthlyOpportunityValues = []
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i)
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const opportunities = await prisma.opportunity.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })
      
      const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0)
      
      monthlyOpportunityValues.push({
        month: month.toISOString().substring(0, 7),
        value: totalValue,
      })
    }

    // Sector distribution
    const sectorDistribution = await prisma.company.groupBy({
      by: ["sector"],
      _count: {
        id: true,
      },
      where: {
        sector: {
          not: null,
        },
      },
    })

    return NextResponse.json({
      statusDistribution,
      monthlyGrowth,
      stageDistribution,
      monthlyOpportunityValues,
      sectorDistribution,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      {
        statusDistribution: [],
        monthlyGrowth: [],
        stageDistribution: [],
        monthlyOpportunityValues: [],
        sectorDistribution: [],
      },
      { status: 500 }
    )
  }
}

