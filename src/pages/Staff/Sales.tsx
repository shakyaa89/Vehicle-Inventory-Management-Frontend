import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ListRestart, Plus, Trash2 } from "lucide-react";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AuthApi, PartApi, SalesInvoiceApi } from "@/constants/Api";
import type { CustomerStats } from "@/types/auth";
import type { Part } from "@/types/part";
import type { SalesInvoiceData } from "@/types/salesInvoice";

interface InvoiceItemForm {
  partId: number | null;
  unitPrice: number;
  partQuantity: number;
}

export default function SalesPage() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { partId: null, unitPrice: 0, partQuantity: 1 },
  ]);
  const [createdInvoice, setCreatedInvoice] = useState<SalesInvoiceData | null>(null);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const [creditDueDate, setCreditDueDate] = useState<string>("");

  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
      const qty = Number.isFinite(item.partQuantity) ? item.partQuantity : 0;
      return sum + Math.max(0, price) * Math.max(0, qty);
    }, 0);
  }, [items]);

  const finalAmount = totalAmount > 5000 ? totalAmount - (totalAmount * 0.1) : totalAmount;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCustomers(true);
      setIsLoadingParts(true);
      try {
        const [customersResponse, partsResponse] = await Promise.all([
          AuthApi.getCustomersApi(),
          PartApi.getAllPartsApi(),
        ]);
        setCustomers(customersResponse.data ?? []);
        setParts(partsResponse.data ?? []);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? "Failed to load customers or parts.");
        } else {
          toast.error("Failed to load customers or parts.");
        }
      } finally {
        setIsLoadingCustomers(false);
        setIsLoadingParts(false);
      }
    };

    fetchData();
  }, []);

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
    setLoyaltyApplied(false);
    setIsCredit(false);
    setCreditDueDate("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
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

    if (isCredit && !creditDueDate) {
      toast.error("Please provide a credit due date.");
      return;
    }

    const payload: SalesInvoiceData = {
      customerId: selectedCustomerId,
      loyaltyApplied,
      isCredit,
      creditDueDate: isCredit ? creditDueDate : null,
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
      toast.success("Sales invoice created successfully.");
      resetForm();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to create invoice.");
      } else {
        toast.error("Failed to create invoice.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StaffSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <StaffNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Sales Invoices</h2>
                <p className="text-sm text-muted-foreground">
                  Capture parts sales and reduce stock instantly.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create invoice</CardTitle>
                  <CardDescription>
                    Select a customer and add parts sold today.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Customer</Label>
                        <Select
                          value={selectedCustomerId ? String(selectedCustomerId) : ""}
                          onValueChange={(value) => setSelectedCustomerId(Number(value))}
                          disabled={isLoadingCustomers || customers.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isLoadingCustomers
                                  ? "Loading customers..."
                                  : "Select a customer"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={String(customer.id)}>
                                  {customer.fullName} ({customer.userName})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Total amount</Label>
                        <Input
                          value={`Rs. ${totalAmount.toFixed(2)}`}
                          readOnly
                          className="font-semibold"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="isCredit"
                          className="mt-1"
                          checked={isCredit}
                          onCheckedChange={(checked) => {
                            const nextValue = Boolean(checked);
                            setIsCredit(nextValue);
                            if (!nextValue) {
                              setCreditDueDate("");
                            }
                          }}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="isCredit" className="text-sm font-normal">
                          Mark as credit sale
                        </Label>
                      </div>

                      {isCredit ? (
                        <div className="space-y-2">
                          <Label>Credit due date</Label>
                          <Input
                            type="date"
                            value={creditDueDate}
                            onChange={(event) => setCreditDueDate(event.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      ) : null}
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
                        disabled={
                          isSubmitting ||
                          isLoadingCustomers ||
                          isLoadingParts ||
                          customers.length === 0 ||
                          parts.length === 0
                        }
                      >
                        {isSubmitting ? "Saving..." : "Create invoice"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice summary</CardTitle>
                    <CardDescription>Review totals before saving.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">
                        {selectedCustomer ? selectedCustomer.fullName : "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Line items</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    {totalAmount > 5000 && <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount - 10%</span>
                      <span className="font-medium">- Rs. {totalAmount * 0.1}</span>
                    </div>}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Credit sale</span>
                      <span className="font-medium">{isCredit ? "Yes" : "No"}</span>
                    </div>
                    {isCredit ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Due date</span>
                        <span className="font-medium">
                          {creditDueDate ? new Date(creditDueDate).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated total</span>
                      <span className="text-lg font-semibold">
                        Rs. {finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last created</CardTitle>
                    <CardDescription>Latest invoice created in this session.</CardDescription>
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
                          <span className="text-muted-foreground">Customer</span>
                          <span className="font-medium">
                            {createdInvoice.customerId ? `#${createdInvoice.customerId}` : "-"}
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
                        Create an invoice to see its details here.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
