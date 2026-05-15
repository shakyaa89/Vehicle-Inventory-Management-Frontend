import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentApi } from "@/constants/Api";
import type { Appointment } from "@/types/appointment";

const isTerminalStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  return normalized === "completed" || normalized === "cancelled" || normalized === "canceled";
};

type UpdateAction = "complete" | "cancel";

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingAction, setUpdatingAction] = useState<UpdateAction | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await AppointmentApi.getAppointmentsApi();
      setAppointments(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load appointments.");
      } else {
        toast.error("Failed to load appointments.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, action: UpdateAction) => {
    setUpdatingId(id);
    setUpdatingAction(action);

    try {
      if (action === "complete") {
        await AppointmentApi.completeAppointmentApi(id);
        toast.success("Appointment marked as completed.");
      } else {
        await AppointmentApi.cancelAppointmentApi(id);
        toast.success("Appointment cancelled.");
      }

      await fetchAppointments();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to update appointment.");
      } else {
        toast.error("Failed to update appointment.");
      }
    } finally {
      setUpdatingId(null);
      setUpdatingAction(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StaffSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <StaffNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Appointments</h2>
              <p className="text-sm text-muted-foreground">
                Update appointment status for today&apos;s arrivals.
              </p>
            </div>

            {isLoading ? (
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
                {appointments.map((appointment) => {
                  const isTerminal = isTerminalStatus(appointment.status);
                  const isUpdating = updatingId === appointment.id;
                  const customerName = appointment.customerName || "Unknown customer";
                  const vehicleName = appointment.vehicleMake || "Unknown vehicle";

                  return (
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
                        <p>Customer: {customerName}</p>
                        <p>Vehicle: {vehicleName}</p>
                        <p>Scheduled: {new Date(appointment.scheduledAt).toLocaleString()}</p>

                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, "complete")}
                            disabled={isTerminal || isUpdating}
                          >
                            {isUpdating && updatingAction === "complete" ? (
                              "Completing..."
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Complete
                              </span>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(appointment.id, "cancel")}
                            disabled={isTerminal || isUpdating}
                          >
                            {isUpdating && updatingAction === "cancel" ? (
                              "Cancelling..."
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
