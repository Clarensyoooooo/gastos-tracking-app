"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Transaction {
  id: string
  date: string
  amount: number
  type: string
  description: string | null
  category_name?: string // Optional if you join it
}

export function CsvExportButton({ data }: { data: any[] }) {
  const downloadCsv = () => {
    if (!data || data.length === 0) return

    // Define CSV headers
    const headers = ["Date", "Type", "Category", "Description", "Amount"]
    
    // Format rows
    const rows = data.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.categories?.name || "Uncategorized", // Access the joined category name
      `"${(t.description || "").replace(/"/g, '""')}"`, // Escape quotes
      t.amount
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `gastos_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={downloadCsv}>
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  )
}