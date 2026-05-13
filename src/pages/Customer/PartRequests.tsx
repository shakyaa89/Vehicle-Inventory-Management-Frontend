import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Package } from "lucide-react";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import CustomerTopbar from "@/components/dashboard/Customer/CustomerNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartRequestApi } from "@/constants/Api";
import { useAuthStore } from "@/store/authStore";
import type { PartRequest, PartRequestData } from "@/types/partRequest";

export default function PartRequestsPage() {
  const { user } = useAuthStore();
  const customerId = Number(user?.id ?? 0);

  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const resetForm = () => {
    setPartName("");
    setQuantity(1);
  };

  const fetchRequests = async () => {
    if (!customerId) return;

    setIsLoadingRequests(true);
    try {
      const response = await PartRequestApi.getPartRequestsByCustomerApi(customerId);
      setRequests(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load requests.");
      } else {
        toast.error("Failed to load requests.");
      }
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!customerId) return;

    fetchRequests();
  }, [customerId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerId) {
      toast.error("Please log in again.");
      return;
    }

    if (!partName.trim()) {
      toast.error("Please provide a part name.");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const payload: PartRequestData = {
      customerId,
      partName: partName.trim(),
      quantity: Number(quantity),
    };

    setIsSubmitting(true);
    try {
      await PartRequestApi.createPartRequestApi(payload);
      toast.success("Part request submitted successfully.");
      resetForm();
      await fetchRequests();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to submit request.");
      } else {
        toast.error("Failed to submit request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <CustomerSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <CustomerTopbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Unavailable part requests</h2>
              <p className="text-sm text-muted-foreground">
                Request parts that are not listed in the catalog.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Request a part</CardTitle>
                  <CardDescription>
                    Add the part name and quantity needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="partName">Part name</Label>
                        <Input
                          id="partName"
                          value={partName}
                          onChange={(event) => setPartName(event.target.value)}
                          placeholder="Brake pad set"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          step={1}
                          value={quantity}
                          onChange={(event) => setQuantity(Number(event.target.value))}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting || !customerId}>
                      {isSubmitting ? "Submitting..." : "Submit request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent requests</CardTitle>
                  <CardDescription>Track your latest part requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingRequests ? (
                    <p className="text-sm text-muted-foreground">Loading requests...</p>
                  ) : requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No requests yet.</p>
                  ) : (
                    requests.slice(0, 4).map((request) => (
                      <div key={request.id} className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{request.partName}</span>
                          <Badge variant="secondary">{request.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Qty: {request.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.requestedDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All requests</CardTitle>
                <CardDescription>Full history of your submitted requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="text-sm text-muted-foreground">Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No requests found.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {requests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader className="flex flex-row items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{request.partName}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Request #{request.id}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">{request.quantity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="secondary">{request.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Requested</span>
                            <span className="font-medium">
                              {new Date(request.requestedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
