"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Wallet } from "lucide-react"
import { format, subDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"

interface Transaction {
  id: string
  amount: number
  type: string
  date: string
  category_id: string
  categories?: { name: string } | null
}

export function AnalyticsDashboard({ transactions }: { transactions: Transaction[] }) {
  const [view, setView] = useState("daily") // daily, weekly, monthly
  const [range, setRange] = useState("30") // 7, 30, 90 days

  // --- Data Processing Logic ---
  const processedData = useMemo(() => {
    const today = new Date()
    let startDate = subDays(today, Number(range))
    let data = []

    if (view === "daily") {
      // Generate all days in range to ensure no gaps
      const days = eachDayOfInterval({ start: startDate, end: today })
      data = days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd")
        // Sum transactions for this specific day
        const dayTx = transactions.filter(t => t.date.startsWith(dayStr))
        const income = dayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
        const expense = dayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
        
        return {
          date: format(day, "MMM dd"),
          fullDate: dayStr,
          income,
          expense,
          net: income - expense
        }
      })
    } 
    else if (view === "monthly") {
      // Group by Month
      // We'll look at the last 6-12 months regardless of 'range' selection for better context
      startDate = subDays(today, 180) 
      const months = eachMonthOfInterval({ start: startDate, end: today })
      
      data = months.map(month => {
        const monthStr = format(month, "yyyy-MM")
        const monthTx = transactions.filter(t => t.date.startsWith(monthStr))
        const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
        const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)

        return {
          date: format(month, "MMM yyyy"),
          income,
          expense
        }
      })
    }

    return data
  }, [transactions, view, range])

  // Calculate Totals for the Cards
  const totals = useMemo(() => {
    return processedData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense
    }), { income: 0, expense: 0 })
  }, [processedData])

  const savingsRate = totals.income > 0 
    ? ((totals.income - totals.expense) / totals.income) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="daily" value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="daily">Daily Trend</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "daily" && (
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-green-600 uppercase">Income</p>
            <p className="text-lg sm:text-2xl font-bold text-green-700">₱{totals.income.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-600 uppercase">Expenses</p>
            <p className="text-lg sm:text-2xl font-bold text-red-700">₱{totals.expense.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-blue-600 uppercase">Saved</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-700">{savingsRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{view === 'daily' ? 'Spending Habits' : 'Monthly Performance'}</CardTitle>
          <CardDescription>
            {view === 'daily' ? `Transaction history for the last ${range} days` : 'Income vs Expenses over time'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'daily' ? (
              <AreaChart data={processedData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#888'}}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#888'}} 
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Income"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Expense"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#888'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#888'}} 
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}