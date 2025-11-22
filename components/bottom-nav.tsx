"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PieChart, PlusCircle, CalendarDays, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "text-blue-600" : "text-gray-400"
  }

  if (pathname === "/login") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background pb-safe pt-2 px-6 z-50 bg-white">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {/* Home is now the Daily View */}
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive("/")}`}>
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-medium">Today</span>
        </Link>
        
        {/* Budget is now Monthly View */}
        <Link href="/budget" className={`flex flex-col items-center gap-1 ${isActive("/budget")}`}>
          <CalendarDays className="h-6 w-6" />
          <span className="text-[10px] font-medium">Monthly</span>
        </Link>

        <Link href="/add" className="flex flex-col items-center gap-1 -mt-8">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg text-white hover:bg-blue-700 transition-colors">
            <PlusCircle className="h-8 w-8" />
          </div>
          <span className="text-[10px] font-medium text-gray-500">Add</span>
        </Link>

        <Link href="/analytics" className={`flex flex-col items-center gap-1 ${isActive("/analytics")}`}>
          <PieChart className="h-6 w-6" />
          <span className="text-[10px] font-medium">Insights</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile")}`}>
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}