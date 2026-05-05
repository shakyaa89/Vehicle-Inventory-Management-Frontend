import {
  DollarSign,
  Boxes,
  Wrench,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react"

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar"
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar"

const revenueData = [
  { name: "Mon", revenue: 4200, services: 1200 },
  { name: "Tue", revenue: 5100, services: 1800 },
  { name: "Wed", revenue: 4800, services: 1500 },
  { name: "Thu", revenue: 6300, services: 2400 },
  { name: "Fri", revenue: 7200, services: 2800 },
  { name: "Sat", revenue: 8100, services: 3200 },
  { name: "Sun", revenue: 5400, services: 1900 },
]

const categoryData = [
  { name: "Brakes", value: 28 },
  { name: "Engine", value: 22 },
  { name: "Filters", value: 18 },
  { name: "Electrical", value: 14 },
  { name: "Tires", value: 11 },
  { name: "Other", value: 7 },
]

const lowStock = [
  {
    sku: "BP-2018",
    name: "Brembo Brake Pads (Front)",
    qty: 3,
    threshold: 10,
    vendor: "Brembo Direct",
  },
  {
    sku: "OF-A24",
    name: "Mann Oil Filter A24",
    qty: 5,
    threshold: 25,
    vendor: "Mann Filter Co.",
  },
  {
    sku: "SP-IRD",
    name: "NGK Iridium Spark Plugs",
    qty: 8,
    threshold: 30,
    vendor: "NGK Performance",
  },
  {
    sku: "AF-K57",
    name: "K&N Air Filter (SUV)",
    qty: 2,
    threshold: 12,
    vendor: "K&N Engineering",
  },
  {
    sku: "BAT-72",
    name: "Optima YellowTop 72Ah",
    qty: 1,
    threshold: 6,
    vendor: "Optima Batteries",
  },
]

const activity = [
  {
    who: "James K.",
    action: "completed work order",
    target: "#WO-1842",
    time: "5m ago",
    initials: "JK",
  },
  {
    who: "Sofia R.",
    action: "registered customer",
    target: "Daniel Cho",
    time: "12m ago",
    initials: "SR",
  },
  {
    who: "Marcus P.",
    action: "received PO from Brembo",
    target: "Rs. 2,140",
    time: "1h ago",
    initials: "MP",
  },
  {
    who: "Elena T.",
    action: "issued invoice",
    target: "#INV-9921",
    time: "2h ago",
    initials: "ET",
  },
]

const hasRevenueData = revenueData.some((point) => point.revenue > 0 || point.services > 0)
const hasCategoryData = categoryData.some((item) => item.value > 0)
const hasLowStockData = lowStock.length > 0
const hasActivityData = activity.length > 0

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Revenue (week)"
                value="Rs. 41,108"
                delta="+12.4%"
                trend="up"
                icon={DollarSign}
                helper="vs. last week"
              />

              <StatCard
                label="Parts in stock"
                value="12,486"
                delta="-2.1%"
                trend="down"
                icon={Boxes}
                helper="across 4 warehouses"
              />

              <StatCard
                label="Active work orders"
                value="38"
                delta="+6"
                trend="up"
                icon={Wrench}
                helper="11 awaiting parts"
              />

              <StatCard
                label="New customers"
                value="142"
                delta="+18%"
                trend="up"
                icon={Users}
                helper="this month"
              />
            </div>


            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Daily revenue and service income
                    </CardDescription>
                  </div>

                  <Tabs defaultValue="week">
                    <TabsList>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent>
                  {hasRevenueData ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="name" />
                          <YAxis
                            tickFormatter={(v:any)=>`Rs. ${v/1000}k`}
                          />
                          <Tooltip />

                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--chart-1)"
                            dot={false}
                          />

                          <Line
                            type="monotone"
                            dataKey="services"
                            stroke="var(--chart-2)"
                            dot={false}
                            strokeDasharray="4 4"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      No revenue data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Sales By Category</CardTitle>
                  <CardDescription>
                    Last 30 days
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {hasCategoryData ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          layout="vertical"
                        >
                          <CartesianGrid horizontal={false}/>
                          <XAxis type="number"/>
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={70}
                          />
                          <Tooltip/>

                          <Bar
                            dataKey="value"
                            fill="var(--chart-1)"
                            radius={[0,4,4,0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      No category sales data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4"/>
                      Low Stock Alerts
                    </CardTitle>

                    <CardDescription>
                      Reorder soon to avoid stockouts
                    </CardDescription>
                  </div>

                  <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4"/>
                    Auto-Reorder All
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3">
                  {hasLowStockData ? lowStock.map(item=>{
                    const pct=Math.round(
                      (item.qty/item.threshold)*100
                    )

                    return(
                      <div
                        key={item.sku}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {item.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              SKU {item.sku} • {item.vendor}
                            </p>
                          </div>

                          <Badge variant="destructive">
                            {item.qty} left
                          </Badge>
                        </div>

                        <div className="mt-3 flex gap-3 items-center">
                          <Progress
                            value={pct}
                            className="flex-1 h-1.5"
                          />

                          <p className="text-xs text-muted-foreground">
                            {item.qty}/{item.threshold}
                          </p>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No low stock alerts right now.
                    </div>
                  )}
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Across all locations
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {hasActivityData ? activity.map((a,i)=>(
                    <div key={i} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {a.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-sm flex-1">
                        <p>
                          <span className="font-medium">
                            {a.who}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {a.action}
                          </span>{" "}
                          <span className="font-medium">
                            {a.target}
                          </span>
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No recent activity to show.
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full"
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>


            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex gap-3 p-5">
                  <CheckCircle2 className="h-5 w-5"/>
                  <div>
                    <p className="font-semibold text-sm">
                      Inventory sync healthy
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last sync 4 minutes ago.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex gap-3 p-5">
                  <TrendingUp className="h-5 w-5"/>
                  <div>
                    <p className="font-semibold text-sm">
                      Margins up 3.2%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vendor consolidation is paying off.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex gap-3 p-5">
                  <Wrench className="h-5 w-5"/>
                  <div>
                    <p className="font-semibold text-sm">
                      14 appointments tomorrow
                    </p>
                    <p className="text-xs text-muted-foreground">
                      3 require overnight parts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}