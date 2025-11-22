"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Loader2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Category = {
  id: string
  name: string
  color: string
  icon: string
}

type Budget = {
  id: string
  category_id: string
  amount: number
  period: string
}

type BudgetListProps = {
  categories: Category[]
  budgets: Budget[]
  expensesByCategory: Record<string, number>
  period: string
}

export function BudgetList({ categories, budgets, expensesByCategory, period }: BudgetListProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEditBudget = (category: Category) => {
    const budget = budgets.find((b) => b.category_id === category.id)
    setSelectedCategory(category)
    setAmount(budget?.amount.toString() || "")
    setIsDialogOpen(true)
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const existingBudget = budgets.find((b) => b.category_id === selectedCategory.id)

      const budgetData = {
        user_id: user.id,
        category_id: selectedCategory.id,
        period,
        amount: Number(amount),
      }

      let error

      if (existingBudget) {
        const { error: updateError } = await supabase
          .from("budgets")
          .update({ amount: Number(amount) })
          .eq("id", existingBudget.id)
        error = updateError
      } else {
        // Check if one exists in DB that we might have missed or created concurrently
        // Actually, simpler to just insert and rely on conflict if possible,
        // but since we don't have a guaranteed unique constraint we can rely on,
        // we'll use the `existingBudget` check from props which is robust enough for single user.
        // Ideally, DB should have unique constraint on (user_id, category_id, period).
        const { error: insertError } = await supabase.from("budgets").insert(budgetData)
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: "Budget saved successfully!",
      })

      setIsDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const budget = budgets.find((b) => b.category_id === category.id)
        const spent = expensesByCategory[category.id] || 0
        const budgetAmount = budget?.amount || 0
        const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0
        const isOverBudget = spent > budgetAmount && budgetAmount > 0

        return (
          <Card key={category.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color || "bg-gray-500"}`} />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => handleEditBudget(category)}
                >
                  {budget ? <Pencil className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Spent: ₱{spent.toFixed(2)}</span>
                  <span className="font-medium">{budgetAmount > 0 ? `₱${budgetAmount.toFixed(2)}` : "No budget"}</span>
                </div>
                {budgetAmount > 0 && (
                  <Progress
                    value={percentage}
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Budget for {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
              Enter the maximum amount you want to spend in this category for {period}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="budget-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    className="pl-7"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Budget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
