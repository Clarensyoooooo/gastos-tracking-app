"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ChartData = {
  category: string
  amount: number
  fill: string
}

export function ExpensePieChart({ data }: { data: ChartData[] }) {
  // 1. Calculate total (for handling empty states)
  const total = data.reduce((acc, curr) => acc + curr.amount, 0)

  // 2. GENERATE DYNAMIC CONFIG
  // This maps every category name in your data to a label and color.
  // Without this, the Legend component doesn't know what text to print!
  const chartConfig = data.reduce((acc, curr) => ({
    ...acc,
    [curr.category]: {
      label: curr.category,
      color: curr.fill,
    }
  }), {
    amount: { label: "Amount" } // Base config
  }) satisfies ChartConfig

  if (total === 0) {
    return (
      <Card className="flex flex-col border-0 shadow-sm">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-[200px] flex items-center justify-center">
          <div className="text-muted-foreground text-sm">No expenses yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col border-0 shadow-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Distribution of your expenses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `₱${Number(value).toFixed(2)}`} />}
            />
            <Pie 
              data={data} 
              dataKey="amount" 
              nameKey="category" 
              innerRadius={60} 
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {/* I adjusted the styling here to make sure long names fit better */}
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-auto [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}