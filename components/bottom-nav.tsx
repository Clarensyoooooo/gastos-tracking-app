"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PieChart, PlusCircle, Settings, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "text-blue-600" : "text-gray-400"
  }

  // Don't show on login page
  if (pathname === "/login") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe pt-2 px-6">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive("/")}`}>
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/analytics" className={`flex flex-col items-center gap-1 ${isActive("/analytics")}`}>
          <PieChart className="h-6 w-6" />
          <span className="text-[10px] font-medium">Analytics</span>
        </Link>
        <Link href="/add" className="flex flex-col items-center gap-1 -mt-8">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg text-white">
            <PlusCircle className="h-8 w-8" />
          </div>
          <span className="text-[10px] font-medium text-gray-500">Add</span>
        </Link>
        <Link href="/budget" className={`flex flex-col items-center gap-1 ${isActive("/budget")}`}>
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-medium">Budget</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile")}`}>
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}
