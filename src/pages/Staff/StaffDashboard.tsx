import { Calendar, ClipboardList, Clock3, Gauge, Wrench, Bell, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

const todaysTasks = [];

const incomingAppointments = [];

const alerts = [];


export default function StaffDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StaffSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <StaffNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h2 className="text-2xl font-semibold tracking-tight">{user?.fullName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your service queue and daily tasks are ready.
                </p>
              </div>

              <Button size="lg" asChild>
                <Link to="/staff/customers/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register customer
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link to="/staff/customers">
                  View customer directory
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Open tasks" value="0" icon={ClipboardList} />
              <StatCard label="Appointments" value="0" icon={Calendar} />
              <StatCard label="Pending parts" value="0" icon={Wrench} />
              <StatCard label="Workload" value="0%" icon={Gauge} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Today&apos;s tasks</CardTitle>
                      <CardDescription>Jobs assigned to your shift</CardDescription>
                    </div>
                    <Badge variant="secondary">Shift A</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todaysTasks.length > 0 ? todaysTasks.map((task) => (
                    <div key={task.title} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.vehicle}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{task.time}</p>
                          <p className="text-xs text-muted-foreground">{task.status}</p>
                        </div>
                        <Badge variant="outline">Open</Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No tasks assigned for today.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shift snapshot</CardTitle>
                  <CardDescription>Current workload and pace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Queue progress</p>
                      <span className="text-xs text-muted-foreground">0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Efficiency</p>
                      <span className="text-xs text-muted-foreground">0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">On-time completion</p>
                      <span className="text-xs text-muted-foreground">0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Incoming appointments</CardTitle>
                  <CardDescription>Customers arriving today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {incomingAppointments.length > 0 ? incomingAppointments.map((item) => (
                    <div key={item.customer} className="flex items-center justify-between rounded-lg border bg-card p-4">
                      <div>
                        <p className="text-sm font-medium">{item.customer}</p>
                        <p className="text-xs text-muted-foreground">{item.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.slot}</p>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No appointments scheduled for today.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Operational alerts</CardTitle>
                  <CardDescription>Things that need attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.length > 0 ? alerts.map((alert) => (
                    <div key={alert.label} className="flex items-center justify-between rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{alert.label}</p>
                          <p className="text-xs text-muted-foreground">Live queue update</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">{alert.value}</span>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No operational alerts right now.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-medium">Break reminder</p>
                    <p className="text-sm text-muted-foreground">
                      Take a short break after your next completed task.
                    </p>
                  </div>
                </div>

                <Button variant="outline">View shift notes</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
