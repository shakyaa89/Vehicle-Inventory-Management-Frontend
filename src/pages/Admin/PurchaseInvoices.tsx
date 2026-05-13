import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ListRestart, Plus, Trash2 } from "lucide-react";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
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
import { PartApi, PurchaseInvoiceApi, VendorApi } from "@/constants/Api";
import type { Part } from "@/types/part";
import type { PurchaseInvoiceData } from "@/types/purchaseInvoice";
import type { Vendor } from "@/types/vendor";

interface InvoiceItemForm {
  partId: number | null;
  unitPrice: number;
  partQuantity: number;
}

export default function PurchaseInvoicesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItemForm[]>([{ partId: null, unitPrice: 0, partQuantity: 1 }]);
  const [createdInvoice, setCreatedInvoice] = useState<PurchaseInvoiceData | null>(null);

  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
      const qty = Number.isFinite(item.partQuantity) ? item.partQuantity : 0;
      return sum + Math.max(0, price) * Math.max(0, qty);
    }, 0);
  }, [items]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingVendors(true);
      setIsLoadingParts(true);
      try {
        const [vendorsResponse, partsResponse] = await Promise.all([
          VendorApi.getAllVendorsApi(),
          PartApi.getAllPartsApi(),
        ]);
        setVendors(vendorsResponse.data ?? []);
        setParts(partsResponse.data ?? []);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? "Failed to load vendors or parts.");
        } else {
          toast.error("Failed to load vendors or parts.");
        }
      } finally {
        setIsLoadingVendors(false);
        setIsLoadingParts(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, {
      partId: null,
      unitPrice: 0,
      partQuantity: 1,
    }]);
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
    setSelectedVendorId(null);
    setItems([{ partId: null, unitPrice: 0, partQuantity: 1 }]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedVendorId) {
      toast.error("Please select a vendor.");
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

    const payload: PurchaseInvoiceData = {
      vendorId: selectedVendorId,
      items: items.map((item) => ({
        partId: item.partId ?? 0,
        unitPrice: Number(item.unitPrice),
        partQuantity: Number(item.partQuantity),
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await PurchaseInvoiceApi.createPurchaseInvoiceApi(payload);
      setCreatedInvoice(response.data);
      toast.success("Purchase invoice created successfully.");
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

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Purchase Invoices
                </h2>
                <p className="text-sm text-muted-foreground">
                  Record vendor purchases and update stock in one step.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create invoice</CardTitle>
                  <CardDescription>
                    Select the vendor and parts to restock.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Vendor</Label>
                        <Select
                          value={selectedVendorId ? String(selectedVendorId) : ""}
                          onValueChange={(value) => setSelectedVendorId(Number(value))}
                          disabled={isLoadingVendors || vendors.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isLoadingVendors
                                  ? "Loading vendors..."
                                  : "Select a vendor"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {vendors.map((vendor) => (
                                <SelectItem key={vendor.id} value={String(vendor.id)}>
                                  {vendor.name} ({vendor.contact})
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
                    </div>

                    <div className="space-y-3">
                      {items.map((item, index) => {
                        const subtotal = Math.max(0, item.unitPrice) * Math.max(0, item.partQuantity);
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
                          isLoadingVendors ||
                          isLoadingParts ||
                          vendors.length === 0 ||
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
                      <span className="text-muted-foreground">Vendor</span>
                      <span className="font-medium">
                        {selectedVendor ? selectedVendor.name : "Not selected"}
                      </span>
                    </div>
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
