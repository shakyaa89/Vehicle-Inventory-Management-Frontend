import {
    Car,
    Calendar,
    Wallet,
    Wrench,
    ArrowRight,
    Clock
} from "lucide-react";

import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import CustomerTopbar from "@/components/dashboard/Customer/CustomerNavbar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";

import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";

const upcoming = [
    {
        service: "Oil Change & Multi-point Inspection",
        vehicle: "2019 Honda Civic EX",
        date: "May 4, 2026",
        time: "10:30 AM",
        tech: "Diego Romero",
        status: "Confirmed",
    },
    {
        service: "Brake Pad Replacement",
        vehicle: "2014 Toyota Tacoma",
        date: "May 18, 2026",
        time: "2:00 PM",
        tech: "Pending assignment",
        status: "Pending",
    },
]

export default function CustomerDashboard() {

    const { user } = useAuthStore();

    return (
        <div className="flex min-h-screen bg-muted/30">

            <CustomerSidebar />

            <div className="flex flex-1 flex-col min-w-0">

                <CustomerTopbar />

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">

                    <div className="space-y-6">

                        <div className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Welcome back,
                                </p>

                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {user.fullName}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                   Everything looks good on your vehicles.
                                </p>

                            </div>

                            <Button size="lg" asChild>
                                <Link to="/customer/appointments/new">
                                    Book a service
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                        </div>


                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard label="Vehicles" value="2" icon={Car} />
                            <StatCard label="Upcoming" value="2" icon={Calendar} />
                            <StatCard label="Spent (YTD)" value="Rs 1,20,000" icon={Wallet} />
                            <StatCard label="Lifetime visits" value="14" icon={Wrench} />
                        </div>


                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Upcoming appointments</CardTitle>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="/customer/appointments">View all</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {upcoming.map((u, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{u.service}</p>
                                                <p className="text-xs text-muted-foreground">{u.vehicle}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Tech: {u.tech}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{u.date}</p>
                                                    <p className="text-xs text-muted-foreground">{u.time}</p>
                                                </div>
                                                <Badge variant={u.status === "Confirmed" ? "default" : "secondary"}>
                                                    {u.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Vehicle health</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">2019 Honda Civic</p>
                                            <span className="text-xs text-muted-foreground">87%</span>
                                        </div>
                                        <Progress value={87} />
                                        <p className="text-xs text-muted-foreground">
                                            Brake pads at 32%. Replace within 5,000 mi.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">2014 Toyota Tacoma</p>
                                            <span className="text-xs text-muted-foreground">71%</span>
                                        </div>
                                        <Progress value={71} />
                                        <p className="text-xs text-muted-foreground">
                                            Coolant flush due in 2 months.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>


                        <Card className="border-primary/30 bg-primary/5">
                            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Clock className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            Time for an oil change
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Schedule a synthetic oil change today.
                                        </p>
                                    </div>

                                </div>

                                <Button asChild>
                                    <Link to="/customer/appointments/new">
                                        Book now
                                    </Link>
                                </Button>

                            </CardContent>
                        </Card>

                    </div>

                </main>

            </div>
        </div>
    );
}