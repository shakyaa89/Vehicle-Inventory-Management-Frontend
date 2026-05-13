import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ListRestart, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import CustomerNavbar from "@/components/dashboard/Customer/CustomerNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartApi, SalesInvoiceApi } from "@/constants/Api";
import { useAuthStore } from "@/store/authStore";
import type { Part } from "@/types/part";
import type { SalesInvoiceData } from "@/types/salesInvoice";

interface InvoiceItemForm {
  partId: number | null;
  unitPrice: number;
  partQuantity: number;
}

export default function PartsSalesPage() {
  const { user } = useAuthStore();
  const customerId = Number(user?.id ?? 0);
  const navigate = useNavigate();

  const [parts, setParts] = useState<Part[]>([]);
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { partId: null, unitPrice: 0, partQuantity: 1 },
  ]);
  const [createdInvoice, setCreatedInvoice] = useState<SalesInvoiceData | null>(null);
  const [invoices, setInvoices] = useState<SalesInvoiceData[]>([]);

  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
      const qty = Number.isFinite(item.partQuantity) ? item.partQuantity : 0;
      return sum + Math.max(0, price) * Math.max(0, qty);
    }, 0);
  }, [items]);

  useEffect(() => {
    const fetchParts = async () => {
      setIsLoadingParts(true);
      try {
        const response = await PartApi.getAllPartsApi();
        setParts(response.data ?? []);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? "Failed to load parts.");
        } else {
          toast.error("Failed to load parts.");
        }
      } finally {
        setIsLoadingParts(false);
      }
    };

    fetchParts();
  }, []);

  const fetchInvoices = async () => {
    if (!customerId) return;

    setIsLoadingInvoices(true);
    try {
      const response = await SalesInvoiceApi.getSalesInvoicesByCustomerApi(customerId);
      setInvoices(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to load invoice history.");
      } else {
        toast.error("Failed to load invoice history.");
      }
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (!customerId) return;
    fetchInvoices();
  }, [customerId]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        partId: null,
        unitPrice: 0,
        partQuantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, updates: Partial<InvoiceItemForm>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handlePartChange = (index: number, value: string) => {
    const partId = Number(value);
    const part = parts.find((item) => item.id === partId);
    updateItem(index, {
      partId,
      ...(part ? { unitPrice: part.price } : {}),
    });
  };

  const handleNumericChange = (
    index: number,
    field: "unitPrice" | "partQuantity",
    value: string
  ) => {
    const parsed = value === "" ? 0 : Number(value);
    updateItem(index, { [field]: parsed } as Partial<InvoiceItemForm>);
  };

  const resetForm = () => {
    setItems([{ partId: null, unitPrice: 0, partQuantity: 1 }]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerId) {
      toast.error("Please log in again.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    const invalidItem = items.find(
      (item) => !item.partId || item.partQuantity <= 0 || item.unitPrice < 0
    );

    if (invalidItem) {
      toast.error("Please complete all line items with valid values.");
      return;
    }

    const stockIssue = items.find((item) => {
      const part = parts.find((entry) => entry.id === item.partId);
      if (!part) return true;
      return item.partQuantity > part.stockQuantity;
    });

    if (stockIssue) {
      toast.error("One or more items exceed available stock.");
      return;
    }

    const payload: SalesInvoiceData = {
      customerId,
      loyaltyApplied: false,
      isCredit: false,
      creditDueDate: null,
      items: items.map((item) => ({
        partId: item.partId ?? 0,
        unitPrice: Number(item.unitPrice),
        partQuantity: Number(item.partQuantity),
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await SalesInvoiceApi.createSalesInvoiceApi(payload);
      setCreatedInvoice(response.data);
      toast.success("Order placed successfully.");
      resetForm();
      await fetchInvoices();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to place order.");
      } else {
        toast.error("Failed to place order.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <CustomerSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <CustomerNavbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Buy parts</h2>
                <p className="text-sm text-muted-foreground">
                  Select parts and place your order instantly.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create order</CardTitle>
                  <CardDescription>
                    Pick parts from the catalog and confirm quantities.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Total amount</Label>
                        <Input
                          value={`Rs. ${totalAmount.toFixed(2)}`}
                          readOnly
                          className="font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {items.map((item, index) => {
                        const subtotal = Math.max(0, item.unitPrice) * Math.max(0, item.partQuantity);
                        const selectedPart = parts.find((part) => part.id === item.partId) ?? null;

                        return (
                          <div
                            key={`item-${index}`}
                            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                          >
                            <div className="space-y-2">
                              <Label>Part</Label>
                              <Select
                                value={item.partId ? String(item.partId) : ""}
                                onValueChange={(value) => handlePartChange(index, value)}
                                disabled={isLoadingParts || parts.length === 0}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={
                                      isLoadingParts
                                        ? "Loading parts..."
                                        : "Select a part"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {parts.map((part) => (
                                      <SelectItem key={part.id} value={String(part.id)}>
                                        {part.name} ({part.sku}) - Rs. {part.price.toFixed(2)}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {selectedPart ? (
                                <p className="text-xs text-muted-foreground">
                                  In stock: {selectedPart.stockQuantity}
                                </p>
                              ) : null}
                            </div>

                            <div className="space-y-2">
                              <Label>Unit price</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(event) =>
                                  handleNumericChange(index, "unitPrice", event.target.value)
                                }
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={item.partQuantity}
                                onChange={(event) =>
                                  handleNumericChange(index, "partQuantity", event.target.value)
                                }
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Subtotal</Label>
                              <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                                Rs. {subtotal.toFixed(2)}
                              </div>
                            </div>

                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveItem(index)}
                                disabled={isSubmitting || items.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <Button type="button" onClick={handleAddItem} disabled={isSubmitting}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add line item
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          <ListRestart className="mr-1 h-4 w-4" />
                          Reset form
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoadingParts || parts.length === 0}
                      >
                        {isSubmitting ? "Placing..." : "Place order"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order summary</CardTitle>
                    <CardDescription>Review your totals before confirming.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Line items</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated total</span>
                      <span className="text-lg font-semibold">
                        Rs. {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last order</CardTitle>
                    <CardDescription>Most recent order placed in this session.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {createdInvoice ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Invoice ID</span>
                          <span className="font-medium">#{createdInvoice.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-medium">
                            Rs. {createdInvoice.totalAmount?.toFixed(2) ?? "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span className="font-medium">
                            {createdInvoice.createdAt
                              ? new Date(createdInvoice.createdAt).toLocaleString()
                              : "-"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        Place an order to see its summary here.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Invoice history</CardTitle>
                  <CardDescription>All parts orders you have placed.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInvoices ? (
                  <div className="text-sm text-muted-foreground">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No invoices found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                          <th className="px-4 py-3 text-left font-semibold">Date</th>
                          <th className="px-4 py-3 text-right font-semibold">Items</th>
                          <th className="px-4 py-3 text-right font-semibold">Total</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">#{invoice.id}</td>
                            <td className="px-4 py-3">
                              {invoice.createdAt
                                ? new Date(invoice.createdAt).toLocaleString()
                                : "Date unavailable"}
                            </td>
                            <td className="px-4 py-3 text-right">{invoice.items?.length ?? 0}</td>
                            <td className="px-4 py-3 text-right">
                              Rs. {invoice.totalAmount?.toFixed(2) ?? "0.00"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  invoice.id && navigate(`/customer/invoices/${invoice.id}`)
                                }
                                disabled={!invoice.id}
                              >
                                View details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
