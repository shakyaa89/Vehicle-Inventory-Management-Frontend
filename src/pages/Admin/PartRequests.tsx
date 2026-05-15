import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { CheckCircle2, Package, XCircle, Trash } from "lucide-react";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthApi, PartRequestApi } from "@/constants/Api";
import type { PartRequest } from "@/types/partRequest";
import type { CustomerStats } from "@/types/auth";

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
  return normalized === "completed" || normalized === "rejected";
};

type UpdateAction = "complete" | "reject" | "delete";

export default function AdminPartRequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingAction, setUpdatingAction] = useState<UpdateAction | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<UpdateAction | null>(null);

  const customerById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.fullName]));
  }, [customers]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await PartRequestApi.getAllPartRequestsApi();
      setRequests(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load part requests.");
      } else {
        toast.error("Failed to load part requests.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await AuthApi.getCustomersApi();
      setCustomers(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load customers.");
      } else {
        toast.error("Failed to load customers.");
      }
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleUpdateStatus = async (id: number, action: Exclude<UpdateAction, "delete">) => {
    setUpdatingId(id);
    setUpdatingAction(action);

    try {
      if (action === "complete") {
        await PartRequestApi.completePartRequestApi(id);
        toast.success("Part request marked as completed.");
      } else {
        await PartRequestApi.rejectPartRequestApi(id);
        toast.success("Part request rejected.");
      }

      await fetchRequests();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to update request.");
      } else {
        toast.error("Failed to update request.");
      }
    } finally {
      setUpdatingId(null);
      setUpdatingAction(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await PartRequestApi.deletePartRequestApi(id);
      toast.success("Part request deleted.");
      await fetchRequests();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to delete request.");
      } else {
        toast.error("Failed to delete request.");
      }
    }
  };

  const openDialog = (id: number, action: UpdateAction) => {
    setSelectedId(id);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedId || !dialogAction) return;

    if (dialogAction === "delete") {
      await handleDelete(selectedId);
    } else {
      await handleUpdateStatus(selectedId, dialogAction);
    }

    setDialogOpen(false);
    setSelectedId(null);
    setDialogAction(null);
  };

  const getDialogText = () => {
    if (dialogAction === "complete") return "Mark this part request as completed?";
    if (dialogAction === "reject") return "Reject this part request?";
    return "Delete this part request permanently?";
  };

  useEffect(() => {
    fetchRequests();
    fetchCustomers();
  }, []);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Part requests</h2>
              <p className="text-sm text-muted-foreground">
                Review and resolve customer part requests.
              </p>
            </div>

            {isLoading ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  Loading part requests...
                </CardContent>
              </Card>
            ) : requests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  No part requests found.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {requests.map((request) => {
                  const isTerminal = isTerminalStatus(request.status);
                  const isUpdating = updatingId === request.id;

                  const customerName =
                    customerById.get(request.customerId) ??
                    (isLoadingCustomers ? "Loading customer..." : "Unknown customer");

                  return (
                    <Card key={request.id}>
                      <CardHeader className="flex flex-row items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Package className="h-5 w-5" />
                        </div>

                        <div>
                          <CardTitle className="text-base">{request.partName}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Status: {request.status}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-1 text-sm">
                        <p>Customer: {customerName}</p>
                        <p>Quantity: {request.quantity}</p>
                        <p>
                          Requested: {new Date(request.requestedDate).toLocaleString()}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button
                            size="sm"
                            onClick={() => openDialog(request.id, "complete")}
                            disabled={isTerminal || isUpdating}
                          >
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(request.id, "reject")}
                            disabled={isTerminal || isUpdating}
                          >
                            <span className="inline-flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              Reject
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(request.id, "delete")}
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
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>{getDialogText()}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}