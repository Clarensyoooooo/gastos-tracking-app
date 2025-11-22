import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: true })

  // Process data for Pie Chart (Expenses by Category)
  const expensesByCategory: Record<string, { amount: number; fill: string }> = {}
  const chartColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]

  transactions
    ?.filter((t) => t.type === "expense")
    .forEach((t, index) => {
      const categoryName = t.categories?.name || "Uncategorized"
      // Use category color if available (mapped to tailwind class usually, so needs mapping or fallback)
      // For simplicity, we will assign chart colors cyclically if no specific color mapping logic exists
      // Since categories.color is a tailwind class like "bg-red-500", we can't use it directly in recharts fill.
      // So we will use the chart theme colors.

      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = {
          amount: 0,
          // Assign a color from the palette based on the number of categories already found
          fill: chartColors[Object.keys(expensesByCategory).length % chartColors.length],
        }
      }
      expensesByCategory[categoryName].amount += Number(t.amount)
    })

  const pieChartData = Object.entries(expensesByCategory)
    .map(([category, { amount, fill }]) => ({
      category,
      amount,
      fill,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Process data for Bar Chart (Monthly Income vs Expense)
  const monthlyData: Record<string, { income: number; expense: number }> = {}

  transactions?.forEach((t) => {
    const date = new Date(t.date)
    const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" }) // e.g., "Jan 2024"

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 }
    }

    if (t.type === "income") {
      monthlyData[monthKey].income += Number(t.amount)
    } else {
      monthlyData[monthKey].expense += Number(t.amount)
    }
  })

  const barChartData = Object.entries(monthlyData).map(([month, { income, expense }]) => ({
    month,
    income,
    expense,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center mr-3">Analytics</h1>
      </div>

      <div className="space-y-6">
        <MonthlyBarChart data={barChartData} />
        <ExpensePieChart data={pieChartData} />
      </div>
    </div>
  )
}
