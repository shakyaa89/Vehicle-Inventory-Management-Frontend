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
import { StatCard } from "@/components/dashboard/stat-card";

import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { VehicleApi, AppointmentApi, SalesInvoiceApi } from "@/constants/Api";
import type { Vehicle } from "@/types/vehicle";
import type { Appointment } from "@/types/appointment";
import type { SalesInvoiceData } from "@/types/salesInvoice";

const upcomingFallback: Appointment[] = [];

export default function CustomerDashboard() {

    const { user } = useAuthStore();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>(upcomingFallback);
    const [invoices, setInvoices] = useState<SalesInvoiceData[]>([]);

    useEffect(() => {
        if (!user || !user.id) return;

        const fetchData = async () => {
            try {
                const [vRes, aRes, sRes] = await Promise.all([
                    VehicleApi.getVehiclesByCustomerApi(user.id),
                    AppointmentApi.getAppointmentsByCustomerApi(user.id),
                    SalesInvoiceApi.getSalesInvoicesByCustomerApi(user.id),
                ]);

                setVehicles(vRes?.data ?? []);
                setAppointments(aRes?.data ?? []);
                setInvoices(sRes?.data ?? []);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };

        fetchData();
    }, [user]);

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
                            <StatCard label="Vehicles" value={String(vehicles.length)} icon={Car} />
                            <StatCard
                                label="Upcoming"
                                value={String(appointments.filter(a => {
                                    try {
                                        const d = new Date(a.scheduledAt);
                                        return d >= new Date() && a.status?.toLowerCase() !== "cancelled";
                                    } catch {
                                        return false;
                                    }
                                }).length)}
                                icon={Calendar}
                            />
                            <StatCard
                                label="Spent (YTD)"
                                value={(() => {
                                    const year = new Date().getFullYear();
                                    const total = invoices.reduce((sum, inv) => {
                                        const created = inv.createdAt ? new Date(inv.createdAt) : null;
                                        if (created && created.getFullYear() === year) {
                                            return sum + (inv.totalAmount ?? 0);
                                        }
                                        return sum;
                                    }, 0);
                                    return `Rs ${total.toLocaleString()}`;
                                })()}
                                icon={Wallet}
                            />
                            <StatCard
                                label="Lifetime visits"
                                value={String(appointments.filter(a => a.status?.toLowerCase() === "completed").length)}
                                icon={Wrench}
                            />
                        </div>


                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Upcoming appointments</CardTitle>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="/customer/appointments">View all</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {appointments
                                        .filter(a => {
                                            try {
                                                const d = new Date(a.scheduledAt);
                                                return d >= new Date() && a.status?.toLowerCase() !== "cancelled";
                                            } catch {
                                                return false;
                                            }
                                        })
                                        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                                        .slice(0, 6)
                                        .map((a) => {
                                            const dt = new Date(a.scheduledAt);
                                            const date = dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
                                            const time = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">Service</p>
                                                        <p className="text-xs text-muted-foreground">{a.vehicleMake ?? "Vehicle"}</p>
                                                        <p className="mt-1 text-xs text-muted-foreground">Tech: TBD</p>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{date}</p>
                                                            <p className="text-xs text-muted-foreground">{time}</p>
                                                        </div>
                                                        <Badge variant={a.status?.toLowerCase() === "confirmed" ? "default" : "secondary"}>
                                                            {a.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
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