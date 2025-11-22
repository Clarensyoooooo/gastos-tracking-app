"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Trophy } from "lucide-react"

type Transaction = {
  id: string
  amount: number
  description: string | null
  date: string
  type: string
  category_id: string
}

type Category = {
  id: string
  name: string
  color: string
}

interface SmartInsightsProps {
  transactions: Transaction[]
  categories: Category[]
}

export function SmartInsights({ transactions, categories }: SmartInsightsProps) {
  const getInsights = () => {
    const insights = []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter expenses only
    const expenses = transactions.filter((t) => t.type === "expense")

    // 1. Top Spending Category (Current Month)
    const currentMonthExpenses = expenses.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    if (currentMonthExpenses.length > 0) {
      const categoryTotals: Record<string, number> = {}
      currentMonthExpenses.forEach((t) => {
        categoryTotals[t.category_id] = (categoryTotals[t.category_id] || 0) + Number(t.amount)
      })

      const topCategoryId = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b,
      )

      const topCategory = categories.find((c) => c.id === topCategoryId)

      if (topCategory) {
        insights.push({
          title: "Top Spending Category",
          description: `You spent the most on ${topCategory.name} this month.`,
          amount: `₱${categoryTotals[topCategoryId].toFixed(2)}`,
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
          color: "bg-yellow-50 border-yellow-200",
        })
      }
    }

    // 2. Month over Month Comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const lastMonthExpenses = expenses.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    })

    const currentMonthTotal = currentMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
    const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0)

    if (lastMonthTotal > 0) {
      const percentChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      const isHigher = percentChange > 0

      insights.push({
        title: "Monthly Trend",
        description: `Spending is ${isHigher ? "up" : "down"} compared to last month.`,
        amount: `${Math.abs(percentChange).toFixed(1)}%`,
        icon: isHigher ? (
          <TrendingUp className="h-5 w-5 text-red-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-green-500" />
        ),
        color: isHigher ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200",
      })
    }

    // 3. Largest Single Transaction (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentExpenses = expenses.filter((t) => new Date(t.date) >= thirtyDaysAgo)

    if (recentExpenses.length > 0) {
      const largestTx = recentExpenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max))

      if (largestTx) {
        insights.push({
          title: "Biggest Expense",
          description: largestTx.description || "Unspecified transaction",
          amount: `₱${Number(largestTx.amount).toFixed(2)}`,
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
          color: "bg-orange-50 border-orange-200",
        })
      }
    }

    return insights
  }

  const insights = getInsights()

  if (insights.length === 0) return null

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-800">Smart Insights</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <Card key={index} className={`border shadow-sm ${insight.color}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white rounded-full shadow-sm">{insight.icon}</div>
                <span className="font-bold text-lg">{insight.amount}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
