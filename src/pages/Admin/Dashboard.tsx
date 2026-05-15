import { useEffect, useState } from "react"
import { AxiosError } from "axios"
import { toast } from "sonner"
import {
  DollarSign,
  Boxes,
  Wrench,
  Users,
  AlertTriangle,
} from "lucide-react"

import {
  Bar,
  BarChart,
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

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/dashboard/stat-card"
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar"
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar"
import { AppointmentApi, AuthApi, PartApi, SalesInvoiceApi } from "@/constants/Api"
import type { Appointment } from "@/types/appointment"
import type { CustomerStats } from "@/types/auth"
import type { Part } from "@/types/part"
import type { SalesInvoiceData } from "@/types/salesInvoice"

const lowStockThreshold = 10

const isTerminalStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  return normalized === "completed" || normalized === "cancelled" || normalized === "canceled"
}

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString("en-LK")}`

const truncateLabel = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [customers, setCustomers] = useState<CustomerStats[]>([])
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [appointmentsResponse, partsResponse, customersResponse, salesInvoicesResponse] =
        await Promise.all([
          AppointmentApi.getAppointmentsApi(),
          PartApi.getAllPartsApi(),
          AuthApi.getCustomersApi(),
          SalesInvoiceApi.getSalesInvoicesApi(),
        ])

      setAppointments(appointmentsResponse.data ?? [])
      setParts(partsResponse.data ?? [])
      setCustomers(customersResponse.data ?? [])
      setSalesInvoices(salesInvoicesResponse.data ?? [])
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load dashboard data.")
      } else {
        toast.error("Failed to load dashboard data.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const totalRevenue = salesInvoices.reduce(
    (sum, invoice) => sum + (invoice.totalAmount ?? 0),
    0
  )

  const partSalesTotals = new Map<number, number>()
  for (const invoice of salesInvoices) {
    for (const item of invoice.items ?? []) {
      const currentTotal = partSalesTotals.get(item.partId) ?? 0
      partSalesTotals.set(item.partId, currentTotal + (item.partQuantity ?? 0))
    }
  }

  const partNameById = new Map(parts.map((part) => [part.id, part.name]))

  const partSalesData = [...partSalesTotals.entries()]
    .map(([partId, totalSold]) => ({
      name: truncateLabel(partNameById.get(partId) ?? `Part ${partId}`, 14),
      unitsSold: totalSold,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 6)

  const partsInStock = parts.reduce((sum, part) => sum + part.stockQuantity, 0)
  const activeAppointments = appointments.filter((appointment) => !isTerminalStatus(appointment.status)).length
  const categoryData = [...parts]
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 6)
    .map((part) => ({
      name: truncateLabel(part.name, 12),
      value: part.stockQuantity,
    }))
  const lowStock = parts
    .filter((part) => part.stockQuantity <= lowStockThreshold)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6)
    .map((part) => ({
      sku: part.sku,
      name: part.name,
      qty: part.stockQuantity,
      threshold: lowStockThreshold,
    }))

  const hasPartSalesData = partSalesData.some((item) => item.unitsSold > 0)
  const hasCategoryData = categoryData.some((item) => item.value > 0)
  const hasLowStockData = lowStock.length > 0
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total revenue"
                value={isLoading ? "-" : formatCurrency(totalRevenue)}
                icon={DollarSign}
                helper="all sales invoices"
              />

              <StatCard
                label="Parts in stock"
                value={isLoading ? "-" : partsInStock.toLocaleString("en-LK")}
                icon={Boxes}
                helper="total units"
              />

              <StatCard
                label="Active work orders"
                value={isLoading ? "-" : activeAppointments.toLocaleString("en-LK")}
                icon={Wrench}
                helper="open appointments"
              />

              <StatCard
                label="New customers"
                value={isLoading ? "-" : customers.length.toLocaleString("en-LK")}
                icon={Users}
                helper="total registered"
              />
            </div>


            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Parts Sales</CardTitle>
                    <CardDescription>
                      Units sold by part
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  {isLoading ? (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      Loading parts sales data...
                    </div>
                  ) : hasPartSalesData ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={partSalesData}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="name" />
                          <YAxis
                            allowDecimals={false}
                          />
                          <Tooltip />

                          <Bar
                            dataKey="unitsSold"
                            fill="var(--chart-1)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      No parts sales data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Stock By Part</CardTitle>
                  <CardDescription>
                    Current inventory levels
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {isLoading ? (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      Loading stock data...
                    </div>
                  ) : hasCategoryData ? (
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
                            tick={{ fontSize: 12 }}
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
                      No stock data available yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-3">
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
                </CardHeader>

                <CardContent className="space-y-3">
                  {isLoading ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Loading stock alerts...
                    </div>
                  ) : hasLowStockData ? lowStock.map(item=>{
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
                              SKU {item.sku}
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
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}