import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SmartInsights } from "@/components/smart-insights"

export default async function Home() {
  const supabase = await createClient()

  // Get user profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  // Fetch categories for insights
  const { data: categories } = await supabase.from("categories").select("*").eq("user_id", user.id)

  const income = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const expenses = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const balance = income - expenses

  return (
    <div className="flex flex-col h-full pb-20">
      <header className="px-6 pt-12 pb-6 bg-blue-600 text-white rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-blue-100 text-sm">Total Balance</p>
            <h1 className="text-4xl font-bold mt-1">₱{balance.toFixed(2)}</h1>
          </div>
          <div className="bg-blue-500 p-2 rounded-full bg-opacity-30">
            <Wallet className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500 bg-opacity-30 rounded-xl p-3 flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-full">
              <ArrowDownIcon className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-blue-100">Income</p>
              <p className="font-semibold">₱{income.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-blue-500 bg-opacity-30 rounded-xl p-3 flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-full">
              <ArrowUpIcon className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-blue-100">Expenses</p>
              <p className="font-semibold">₱{expenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 flex-1">
        {transactions && categories && <SmartInsights transactions={transactions} categories={categories} />}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
          <Link href="/transactions" className="text-blue-600 text-sm font-medium">
            See All
          </Link>
        </div>

        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <Link href={`/transactions/${transaction.id}/edit`} key={transaction.id} className="block">
                <Card className="shadow-sm border-0 bg-white hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₱{Number(transaction.amount).toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="shadow-sm border-0 bg-gray-50">
              <CardContent className="p-4 flex justify-center text-gray-500 py-8">No transactions yet</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
