import { Calendar, Wallet, Wrench, Clock, ArrowRight } from "lucide-react";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import StaffTopbar from "@/components/dashboard/Staff/StaffNavbar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppointmentApi, SalesInvoiceApi } from "@/constants/Api";
import type { Appointment } from "@/types/appointment";
import type { SalesInvoiceData } from "@/types/salesInvoice";

export default function StaffDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [invoices, setInvoices] = useState<SalesInvoiceData[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [aRes, sRes] = await Promise.all([
                    AppointmentApi.getAppointmentsApi(),
                    SalesInvoiceApi.getSalesInvoicesApi(),
                ]);
                setAppointments(aRes?.data ?? []);
                setInvoices(sRes?.data ?? []);
            } catch (err) {
                console.error("Staff dashboard fetch error", err);
            }
        };
        fetch();
    }, []);

    const today = new Date();
    const isSameDay = (d1?: string | null) => {
        if (!d1) return false;
        const dt = new Date(d1);
        return dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth() && dt.getDate() === today.getDate();
    };

    const totalAppointments = appointments.length;
    const todaysAppointments = appointments.filter(a => isSameDay(a.scheduledAt)).length;
    const pendingAppointments = appointments.filter(a => a.status?.toLowerCase() === "pending").length;

    const ytdRevenue = (() => {
        const year = today.getFullYear();
        const total = invoices.reduce((sum, inv) => {
            const created = inv.createdAt ? new Date(inv.createdAt) : null;
            if (created && created.getFullYear() === year) return sum + (inv.totalAmount ?? 0);
            return sum;
        }, 0);
        return `Rs ${total.toLocaleString()}`;
    })();

    const upcoming = appointments
        .filter(a => {
            try {
                const d = new Date(a.scheduledAt);
                return d >= new Date() && a.status?.toLowerCase() !== "cancelled";
            } catch {
                return false;
            }
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 6);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <StaffSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <StaffTopbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Good day,</p>
                                <h2 className="text-2xl font-semibold tracking-tight">Staff Dashboard</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Overview of appointments and revenue.</p>
                            </div>

                            <Button size="lg" asChild>
                                <Link to="/staff/appointments/new">
                                    Create appointment
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard label="Total appts" value={String(totalAppointments)} icon={Calendar} />
                            <StatCard label="Today's appts" value={String(todaysAppointments)} icon={Calendar} />
                            <StatCard label="Pending" value={String(pendingAppointments)} icon={Wrench} />
                            <StatCard label="YTD Revenue" value={ytdRevenue} icon={Wallet} />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Upcoming appointments</CardTitle>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="/staff/appointments">View all</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {upcoming.map((a) => {
                                        const dt = new Date(a.scheduledAt);
                                        const date = dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
                                        const time = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                                        return (
                                            <div key={a.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">{a.customerName ?? `Customer #${a.customerId ?? a.customerId}`}</p>
                                                        <p className="text-xs text-muted-foreground">{a.vehicleMake ?? `Vehicle #${a.vehicleId}`}</p>
                                                    </div>
                                                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{date}</p>
                                                        <p className="text-xs text-muted-foreground">{time}</p>
                                                    </div>
                                                    <Badge variant={a.status?.toLowerCase() === "confirmed" ? "default" : "secondary"}>{a.status}</Badge>
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
                                        <p className="font-medium">Quick reminder</p>
                                        <p className="text-sm text-muted-foreground">Check today's schedule and prepare tools.</p>
                                    </div>
                                </div>
                                <Button asChild>
                                    <Link to="/staff/appointments/new">Create</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
