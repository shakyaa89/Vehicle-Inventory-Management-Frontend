import CustomerTopbar from "@/components/dashboard/Customer/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentApi } from "@/constants/Api";
import { VehicleApi } from "@/constants/Api";
import { useAuthStore } from "@/store/authStore";
import type { Appointment, AppointmentData } from "@/types/appointment";
import type { Vehicle } from "@/types/vehicle";
import { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AppointmentsPage() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [vehicleId, setVehicleId] = useState("");

    const customerId = Number(user?.id ?? 0);

    // Generate time slots: 10 AM to 2 PM with 30-min intervals
    const timeSlots = [
        "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"
    ];

    const resetForm = () => {
        setAppointmentDate("");
        setAppointmentTime("");
        setVehicleId("");
    };

    const fetchAppointments = async () => {
        if (!customerId) return;

        setIsLoadingAppointments(true);
        try {
            const response = await AppointmentApi.getAppointmentsByCustomerApi(customerId);
            setAppointments(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to fetch appointments.");
            } else {
                toast.error("Failed to fetch appointments.");
            }
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const fetchVehicles = async () => {
        if (!customerId) return;

        setIsLoadingVehicles(true);
        try {
            const response = await VehicleApi.getVehiclesByCustomerApi(customerId);
            setVehicles(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to fetch vehicles.");
            } else {
                toast.error("Failed to fetch vehicles.");
            }
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    const handleCreateAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!customerId) {
            toast.error("Please log in again.");
            return;
        }

        if (!vehicleId) {
            toast.error("Please select a vehicle.");
            return;
        }

        if (!appointmentDate || !appointmentTime) {
            toast.error("Please select date and time.");
            return;
        }

        // Combine date and time
        const scheduledAtDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

        const appointmentData: AppointmentData = {
            customerId,
            scheduledAt: scheduledAtDateTime.toISOString(),
            status: "Pending",
            vehicleId: Number(vehicleId),
        };

        setIsCreatingAppointment(true);
        try {
            await AppointmentApi.addAppointmentApi(appointmentData);
            toast.success("Appointment created successfully.");
            setIsModalOpen(false);
            resetForm();
            await fetchAppointments();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to create appointment.");
            } else {
                toast.error("Failed to create appointment.");
            }
        } finally {
            setIsCreatingAppointment(false);
        }
    };

    useEffect(() => {
        if (!customerId) return;

        fetchAppointments();
        fetchVehicles();
    }, [customerId]);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <CustomerSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <CustomerTopbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">My Appointments</h2>
                                <p className="text-sm text-muted-foreground">Customer-specific appointments from the backend.</p>
                            </div>

                            <Button type="button" onClick={() => setIsModalOpen(true)} disabled={isLoadingVehicles}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Appointment
                            </Button>
                        </div>

                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Appointment</DialogTitle>
                                    <DialogDescription>
                                        Fill the form below and submit to add a new appointment.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleCreateAppointment} className="space-y-4 px-4 pb-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="appointmentDate">Appointment Date</Label>
                                        <Input
                                            id="appointmentDate"
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(event) => setAppointmentDate(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Appointment Time</Label>
                                        <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select time (10 AM - 2 PM)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => {
                                                    const [hours, minutes] = time.split(":");
                                                    const hour = parseInt(hours);
                                                    const ampm = hour >= 12 ? "PM" : "AM";
                                                    const display12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                                    const label = `${display12}:${minutes} ${ampm}`;
                                                    return (
                                                        <SelectItem key={time} value={time}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Vehicle</Label>
                                        <Select value={vehicleId} onValueChange={setVehicleId}>
                                            <SelectTrigger className="w-full" disabled={isLoadingVehicles || vehicles.length === 0}>
                                                <SelectValue placeholder="Select your vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingVehicles ? (
                                                    <SelectItem value="__loading" disabled>
                                                        Loading vehicles...
                                                    </SelectItem>
                                                ) : vehicles.length === 0 ? (
                                                    <SelectItem value="__empty" disabled>
                                                        No vehicles available
                                                    </SelectItem>
                                                ) : (
                                                    vehicles.map((vehicle) => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                            {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.vehicleNumber})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isCreatingAppointment || isLoadingVehicles || vehicles.length === 0}
                                        className="w-full"
                                    >
                                        {isCreatingAppointment ? "Creating..." : "Create Appointment"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {isLoadingAppointments ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    Loading appointments...
                                </CardContent>
                            </Card>
                        ) : appointments.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    No appointments found.
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appointment history</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="px-4 py-3 text-left font-semibold">Appointment</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map((appointment) => {
                                                    const vehicleLabel =
                                                        appointment.vehicleMake ||
                                                        `Vehicle #${appointment.vehicleId}`;

                                                    return (
                                                        <tr
                                                            key={appointment.id}
                                                            className="border-b hover:bg-muted/30 transition-colors"
                                                        >
                                                            <td className="px-4 py-3 font-medium">
                                                                #{appointment.id}
                                                            </td>
                                                            <td className="px-4 py-3">{vehicleLabel}</td>
                                                            <td className="px-4 py-3">
                                                                {new Date(appointment.scheduledAt).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-3">{appointment.status}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}