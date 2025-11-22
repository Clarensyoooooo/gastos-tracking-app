import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import { AnalyticsDashboard } from "@/components/analytics-dashboard" // Import the new component
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch ALL transactions (let the client filter them)
  // We fetch specific fields to keep the payload light
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      date,
      category_id,
      description,
      categories (
        name,
        color
      )
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: true })

  // Prepare data for the Pie Chart (Still useful to keep separate)
  const expensesByCategory: Record<string, { amount: number; fill: string }> = {}
  // Simple color palette for pie chart
  const pieColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"]

  transactions
    ?.filter((t) => t.type === "expense")
    .forEach((t, index) => {
      const categoryName = t.categories?.name || "Uncategorized"
      
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = {
          amount: 0,
          // Use the index to pick a color from our palette
          fill: pieColors[Object.keys(expensesByCategory).length % pieColors.length],
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center mr-3">Analytics</h1>
      </div>

      <div className="space-y-6">
        {/* The New Interactive Dashboard */}
        <AnalyticsDashboard transactions={transactions || []} />

        {/* Existing Pie Chart */}
        <ExpensePieChart data={pieChartData} />
      </div>
    </div>
  )
}