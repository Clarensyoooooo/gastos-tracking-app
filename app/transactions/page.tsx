import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TransactionsPage() {
  const supabase = await createClient()

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

  // Group transactions by date
  const groupedTransactions = transactions?.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(transaction)
      return acc
    },
    {} as Record<string, typeof transactions>,
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center mr-3">All Transactions</h1>
      </div>

      <div className="space-y-6">
        {groupedTransactions && Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">{date}</h3>
              <div className="space-y-3">
                {dayTransactions?.map((transaction) => (
                  <Link href={`/transactions/${transaction.id}/edit`} key={transaction.id} className="block">
                    <Card className="shadow-sm border-0 bg-white hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowDownIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUpIcon className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}₱{Number(transaction.amount).toFixed(2)}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions found</p>
            <Link href="/add">
              <span className="text-blue-600 font-medium mt-2 inline-block">Add your first transaction</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
