import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DailyDashboard } from "@/components/daily-dashboard"
import { YesterdayRecap } from "@/components/yesterday-recap"
import { format, subDays } from "date-fns"
import { Settings2 } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Dates
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const yesterday = subDays(today, 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // 1. Fetch Today's Data
  const { data: dailyBudget } = await supabase
    .from("daily_budgets")
    .select("amount")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .single()

  // Fetch Today's Transactions (00:00 - 23:59)
  const { data: todayTransactions } = await supabase
    .from("transactions")
    .select(`*, categories (name, color)`)
    .eq("user_id", user.id)
    .gte("date", `${todayStr}T00:00:00`)
    .lte("date", `${todayStr}T23:59:59`)
    .order("date", { ascending: false })

  // 2. Fetch Yesterday's Data (For the Recap)
  const { data: yesterdayBudget } = await supabase
    .from("daily_budgets")
    .select("amount")
    .eq("user_id", user.id)
    .eq("date", yesterdayStr)
    .single()

  const { data: yesterdayTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", `${yesterdayStr}T00:00:00`)
    .lte("date", `${yesterdayStr}T23:59:59`)

  const yesterdaySpent = yesterdayTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Daily Header */}
      <header className="bg-white border-b px-6 pt-12 pb-4 mb-6 flex justify-between items-end">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {format(today, "EEEE")}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {format(today, "MMM d")}
          </h1>
        </div>
        {/* Quick link to settings or monthly view if needed */}
        <Link href="/budget">
          <div className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Settings2 className="h-5 w-5 text-gray-600" />
          </div>
        </Link>
      </header>

      <div className="px-6">
        {/* Block 1: Yesterday's Scorecard */}
        <YesterdayRecap 
          spent={yesterdaySpent} 
          budget={yesterdayBudget?.amount || null} 
        />

        {/* Block 2: Today's Main Dashboard */}
        <DailyDashboard 
          date={todayStr} 
          transactions={todayTransactions || []} 
          initialBudget={dailyBudget?.amount || null} 
        />
      </div>
    </div>
  )
}