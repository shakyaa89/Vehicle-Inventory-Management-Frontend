import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Trash, XCircle } from "lucide-react";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentApi } from "@/constants/Api";
import type { Appointment } from "@/types/appointment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const isTerminalStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  return normalized === "completed" || normalized === "cancelled" || normalized === "canceled";
};

type UpdateAction = "complete" | "cancel";
type DialogAction = "delete" | "complete" | "cancel";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingAction, setUpdatingAction] = useState<UpdateAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction | null>(null);

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

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await AppointmentApi.deleteAppointmentApi(id);
      toast.success("Appointment Deleted.");
      await fetchAppointments();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to delete appointment.");
      } else {
        toast.error("Failed to delete appointment.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId || !dialogAction) return;

    if (dialogAction === "complete") {
      await handleUpdateStatus(selectedId, "complete");
    }

    if (dialogAction === "cancel") {
      await handleUpdateStatus(selectedId, "cancel");
    }

    if (dialogAction === "delete") {
      await handleDelete(selectedId);
    }

    setDialogOpen(false);
    setSelectedId(null);
    setDialogAction(null);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openDialog = (id: number, action: DialogAction) => {
    setSelectedId(id);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const getDialogText = () => {
    if (dialogAction === "complete") return "Mark this appointment as completed?";
    if (dialogAction === "cancel") return "Cancel this appointment?";
    return "Delete this appointment permanently?";
  };

  const isTerminal = (status: string) => isTerminalStatus(status);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Appointments</h2>
              <p className="text-sm text-muted-foreground">
                Review and update customer appointments.
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
                          <CardTitle className="text-base">
                            Appointment #{appointment.id}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Status: {appointment.status}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-1 text-sm">
                        <p>Customer: {customerName}</p>
                        <p>Vehicle: {vehicleName}</p>
                        <p>
                          Scheduled:{" "}
                          {new Date(appointment.scheduledAt).toLocaleString()}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button
                            size="sm"
                            onClick={() => openDialog(appointment.id, "complete")}
                            disabled={isTerminal(appointment.status) || isUpdating}
                          >
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(appointment.id, "cancel")}
                            disabled={isTerminal(appointment.status) || isUpdating}
                          >
                            <span className="inline-flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(appointment.id, "delete")}
                            disabled={deleting}
                          >
                            <span className="inline-flex items-center gap-2">
                              <Trash className="h-4 w-4" />
                              Delete
                            </span>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>{getDialogText()}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={deleting || updatingId !== null}
            >
              Cancel
            </Button>

            <Button
              variant={dialogAction === "delete" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={deleting || updatingId !== null}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}