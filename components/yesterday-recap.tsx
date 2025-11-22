"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface YesterdayRecapProps {
  spent: number
  budget: number | null
}

export function YesterdayRecap({ spent, budget }: YesterdayRecapProps) {
  if (!budget) return null // Don't show if no budget was set yesterday

  const saved = budget - spent
  const isWin = saved >= 0

  return (
    <Card className={`border-0 shadow-sm mb-6 overflow-hidden ${isWin ? 'bg-emerald-50' : 'bg-red-50'}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2 rounded-full ${isWin ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {isWin ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isWin ? 'text-emerald-600' : 'text-red-600'}`}>
            Yesterday's Result
          </p>
          <p className="text-gray-900 font-medium text-sm">
            {isWin 
              ? `You saved ₱${saved.toFixed(2)}!` 
              : `You went over by ₱${Math.abs(saved).toFixed(2)}.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}