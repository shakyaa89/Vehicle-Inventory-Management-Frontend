import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  delta?: string
  trend?: "up" | "down" | "flat"
  icon?: LucideIcon
  helper?: string
}

export function StatCard({ label, value, delta, trend = "up", icon: Icon, helper }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 px-10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                trend === "down" && "bg-destructive/10 text-destructive",
                trend === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </span>
          )}
        </div>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  )
}
