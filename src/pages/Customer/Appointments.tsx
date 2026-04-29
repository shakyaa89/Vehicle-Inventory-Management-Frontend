import CustomerTopbar from "@/components/dashboard/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";
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
import { CalendarClock, Plus } from "lucide-react";
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

    const [scheduledAt, setScheduledAt] = useState("");
    const [vehicleId, setVehicleId] = useState("");

    const customerId = Number(user?.id ?? 0);

    const resetForm = () => {
        setScheduledAt("");
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

        const appointmentData: AppointmentData = {
            customerId,
            scheduledAt: new Date(scheduledAt).toISOString(),
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
                                        <Label htmlFor="scheduledAt">Scheduled At</Label>
                                        <Input
                                            id="scheduledAt"
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(event) => setScheduledAt(event.target.value)}
                                            required
                                        />
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
                            <div className="grid gap-4 md:grid-cols-2">
                                {appointments.map((appointment) => (
                                    <Card key={appointment.id}>
                                        <CardHeader className="flex flex-row items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <CalendarClock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Appointment #{appointment.id}</CardTitle>
                                                <p className="text-xs text-muted-foreground">Status: {appointment.status}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <p>Vehicle ID: {appointment.vehicleId}</p>
                                            <p>Scheduled: {new Date(appointment.scheduledAt).toLocaleString()}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}