import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DailyDashboard } from "@/components/daily-dashboard"
import { format } from "date-fns"

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get Today's Date (Server Time - simplified for now)
  // Ideally, we pass the user's timezone, but for simplicity, we use ISO date
  const today = new Date().toISOString().split('T')[0]
  const displayDate = format(new Date(), "EEEE, MMM d")

  // Fetch Today's Budget
  const { data: dailyBudget } = await supabase
    .from("daily_budgets")
    .select("amount")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Fetch Today's Transactions
  // We assume the database stores timestamps. We filter from 00:00 to 23:59 today.
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
    .gte("date", `${today}T00:00:00`)
    .lte("date", `${today}T23:59:59`)
    .order("date", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-6 pt-12 pb-4 mb-6">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Today's Overview</p>
        <h1 className="text-2xl font-bold text-gray-900">{displayDate}</h1>
      </div>

      <div className="px-6">
        <DailyDashboard 
          date={today} 
          transactions={transactions || []} 
          initialBudget={dailyBudget?.amount || null} 
        />
      </div>
    </div>
  )
}