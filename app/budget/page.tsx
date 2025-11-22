import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowLeft, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { BudgetList } from "@/components/budget-list"
import { format } from "date-fns"

export default async function BudgetPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const currentDate = new Date()
  const period = format(currentDate, "yyyy-MM")
  const displayMonth = format(currentDate, "MMMM yyyy")

  // Fetch categories (expenses only)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .order("name")

  // Fetch budgets for current period
  const { data: budgets } = await supabase.from("budgets").select("*").eq("user_id", user.id).eq("period", period)

  // Fetch expenses for current month to calculate progress
  // We need first and last day of month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)

  // Aggregate expenses by category
  const expensesByCategory: Record<string, number> = {}
  transactions?.forEach((t) => {
    expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + Number(t.amount)
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center mr-3">Budget</h1>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 text-sm font-medium text-gray-600">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          {displayMonth}
        </div>
      </div>

      {categories && categories.length > 0 ? (
        <BudgetList
          categories={categories}
          budgets={budgets || []}
          expensesByCategory={expensesByCategory}
          period={period}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No expense categories found.</p>
          <Link href="/add" className="text-blue-600 font-medium mt-2 inline-block">
            Create a category first
          </Link>
        </div>
      )}
    </div>
  )
}
