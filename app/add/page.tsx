import { createClient } from "@/lib/supabase/server"
import { TransactionForm } from "@/components/transaction-form"
import { redirect } from "next/navigation"

export default async function AddPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: categories } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <TransactionForm categories={categories || []} />
    </div>
  )
}
