import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowLeft, CalendarIcon, ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react"
import Link from "next/link"
import { BudgetList } from "@/components/budget-list"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const currentDate = new Date()
  const period = format(currentDate, "yyyy-MM")
  const displayMonth = format(currentDate, "MMMM yyyy")

  // 1. Fetch Monthly Stats (Moved from old Home)
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)

  const income = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const expenses = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const balance = income - expenses

  // 2. Fetch Categories & Budgets
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .order("name")

  const { data: budgets } = await supabase.from("budgets").select("*").eq("user_id", user.id).eq("period", period)

  // Aggregate expenses by category for the progress bars
  const expensesByCategory: Record<string, number> = {}
  transactions?.forEach((t) => {
    if (t.type === 'expense') {
      expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + Number(t.amount)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Monthly Header Summary */}
      <div className="bg-blue-600 text-white pt-12 pb-8 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            {displayMonth}
          </h1>
          <div className="bg-white/20 p-2 rounded-full">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-700/50 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-blue-100 text-xs mb-1">Monthly Income</p>
            <p className="text-lg font-bold flex items-center gap-1">
              <ArrowDownIcon className="h-4 w-4 text-green-400" />
              ₱{income.toFixed(0)}
            </p>
          </div>
          <div className="bg-blue-700/50 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-blue-100 text-xs mb-1">Monthly Spent</p>
            <p className="text-lg font-bold flex items-center gap-1">
              <ArrowUpIcon className="h-4 w-4 text-red-400" />
              ₱{expenses.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Category Budgets</h2>
          {categories && categories.length > 0 ? (
            <BudgetList
              categories={categories}
              budgets={budgets || []}
              expensesByCategory={expensesByCategory}
              period={period}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed">
              <p>No categories yet.</p>
              <Link href="/add" className="text-blue-600 font-medium mt-2 inline-block">
                Add categories
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}