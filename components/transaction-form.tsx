"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { format } from "date-fns"
import { CalendarIcon, Loader2, ArrowLeft, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Category = {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

type Transaction = {
  id: string
  amount: number
  description: string | null
  date: string
  type: string
  category_id: string
}

export function TransactionForm({
  categories,
  initialData,
}: {
  categories: Category[]
  initialData?: Transaction
}) {
  const router = useRouter()
  const supabase = createClient()

  const [amount, setAmount] = useState(initialData?.amount.toString() || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [date, setDate] = useState<Date | undefined>(initialData ? new Date(initialData.date) : new Date())
  const [type, setType] = useState<"income" | "expense">((initialData?.type as "income" | "expense") || "expense")
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCategories = categories.filter((c) => c.type === type)
  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError("Supabase client not initialized")
      return
    }

    if (!amount || !date || !categoryId) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const transactionData = {
        amount: Number(amount),
        description,
        date: date.toISOString(),
        type,
        category_id: categoryId,
        user_id: user.id,
      }

      if (isEditing) {
        const { error } = await supabase.from("transactions").update(transactionData).eq("id", initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("transactions").insert(transactionData)
        if (error) throw error
      }

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !supabase) return
    setIsLoading(true)
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", initialData.id)

      if (error) throw error

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const seedCategories = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const defaultCategories = [
        { name: "Food", type: "expense", icon: "utensils", color: "bg-orange-500", user_id: user.id },
        { name: "Transport", type: "expense", icon: "car", color: "bg-blue-500", user_id: user.id },
        { name: "Shopping", type: "expense", icon: "shopping-bag", color: "bg-pink-500", user_id: user.id },
        { name: "Entertainment", type: "expense", icon: "film", color: "bg-purple-500", user_id: user.id },
        { name: "Health", type: "expense", icon: "heart", color: "bg-red-500", user_id: user.id },
        { name: "Salary", type: "income", icon: "briefcase", color: "bg-green-500", user_id: user.id },
        { name: "Freelance", type: "income", icon: "laptop", color: "bg-cyan-500", user_id: user.id },
        { name: "Investment", type: "income", icon: "trending-up", color: "bg-emerald-500", user_id: user.id },
      ]

      const { error } = await supabase.from("categories").insert(defaultCategories)
      if (error) throw error

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!supabase) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Supabase is not connected. Please check your environment variables.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold flex-1 text-center mr-3">
          {isEditing ? "Edit Transaction" : "Add Transaction"}
        </h1>
        {isEditing && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(val) => val && setType(val as "income" | "expense")}
              >
                <ToggleGroupItem
                  value="expense"
                  className="px-8 data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
                >
                  Expense
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="income"
                  className="px-8 data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
                >
                  Income
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-center block text-muted-foreground">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₱</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="text-center text-3xl font-bold h-16 pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {categories.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed bg-transparent"
                  onClick={seedCategories}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Default Categories
                </Button>
              ) : (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${category.color || "bg-gray-500"}`} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">No categories found for {type}</div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What is this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className={`w-full h-12 text-lg ${type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Update Transaction" : "Save Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
