"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ArrowDownIcon, ArrowUpIcon, Plus, AlertTriangle, CheckCircle2, Wallet } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  categories?: { name: string; color: string } | null
}

export function DailyDashboard({ 
  date, 
  transactions, 
  initialBudget 
}: { 
  date: string, 
  transactions: Transaction[], 
  initialBudget: number | null 
}) {
  const [budget, setBudget] = useState<string>(initialBudget?.toString() || "")
  const [isSettingBudget, setIsSettingBudget] = useState(!initialBudget)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const currentBudget = Number(budget) || 0
  const remaining = currentBudget - totalSpent
  const percentage = currentBudget > 0 ? (totalSpent / currentBudget) * 100 : 0
  
  // Analytics Logic
  let statusColor = "bg-blue-600"
  let statusMessage = "You're doing great!"
  
  if (currentBudget > 0) {
    if (percentage > 100) {
      statusColor = "bg-red-600"
      statusMessage = "You've exceeded your daily budget!"
    } else if (percentage > 80) {
      statusColor = "bg-orange-500"
      statusMessage = "Careful, you're close to the limit."
    } else if (percentage < 50) {
      statusColor = "bg-green-500"
      statusMessage = "Plenty of budget left for today."
    }
  }

  const handleSaveBudget = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('daily_budgets')
        .upsert({ 
          user_id: user.id, 
          date: date, 
          amount: Number(budget) 
        }, { onConflict: 'user_id, date' })

      if (error) throw error
      setIsSettingBudget(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving budget:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className={`h-2 w-full ${statusColor}`} />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Daily Budget</p>
              <h2 className="text-3xl font-bold mt-1">
                {isSettingBudget ? (
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <span className="text-lg text-muted-foreground">₱</span>
                    <Input 
                      type="number" 
                      value={budget} 
                      onChange={(e) => setBudget(e.target.value)}
                      className="h-9 text-lg font-bold"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span onClick={() => setIsSettingBudget(true)} className="cursor-pointer hover:underline decoration-dashed underline-offset-4">
                    ₱{currentBudget.toFixed(2)}
                  </span>
                )}
              </h2>
            </div>
            <div className={`p-2 rounded-full bg-opacity-10 ${statusColor.replace('bg-', 'bg-opacity-20 text-')}`}>
              {percentage > 100 ? <AlertTriangle className={`h-6 w-6 ${statusColor.replace('bg-', 'text-')}`} /> : <Wallet className="h-6 w-6 text-blue-600" />}
            </div>
          </div>

          {isSettingBudget ? (
            <Button size="sm" onClick={handleSaveBudget} disabled={loading} className="w-full mt-2">
              {loading ? "Saving..." : "Set Budget"}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent: ₱{totalSpent.toFixed(2)}</span>
                <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                  {remaining < 0 ? "Over: " : "Left: "}₱{Math.abs(remaining).toFixed(2)}
                </span>
              </div>
              <Progress value={percentage} className={`h-3 ${percentage > 100 ? '[&>div]:bg-red-600' : ''}`} />
              <p className="text-xs text-center text-muted-foreground pt-2 flex items-center justify-center gap-1">
                {percentage > 100 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                {statusMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/add" className="block">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1 border-dashed hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600">
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add Transaction</span>
          </Button>
        </Link>
        <Link href="/budget" className="block">
           <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1 hover:bg-gray-50">
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-medium">Monthly Budget</span>
          </Button>
        </Link>
      </div>

      {/* Today's Transactions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Today's Activity</h3>
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <Link href={`/transactions/${t.id}/edit`} key={t.id}>
              <Card className="mb-3 shadow-sm border-0 hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                      {t.type === "income" ? (
                        <ArrowDownIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description || "No description"}</p>
                      <p className="text-xs text-muted-foreground">{t.categories?.name || "Uncategorized"}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "income" ? "+" : "-"}₱{Number(t.amount).toFixed(2)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-400 text-sm">No transactions yet today.</p>
          </div>
        )}
      </div>
    </div>
  )
}