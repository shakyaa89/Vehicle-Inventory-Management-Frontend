import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";
import CustomerNavbar from "@/components/dashboard/Customer/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartApi, SalesInvoiceApi } from "@/constants/Api";
import type { Part } from "@/types/part";
import type { SalesInvoiceData } from "@/types/salesInvoice";

export default function CustomerInvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = Number(id);

  const [invoice, setInvoice] = useState<SalesInvoiceData | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const partById = useMemo(() => {
    return new Map(parts.map((part) => [part.id, part]));
  }, [parts]);

  const invoiceTotals = useMemo(() => {
    if (!invoice) return null;

    const subtotal = (invoice.items ?? []).reduce((sum, item) => {
      const itemSubtotal = Number.isFinite(item.subTotal)
        ? Number(item.subTotal)
        : Number(item.unitPrice) * Number(item.partQuantity);
      return sum + itemSubtotal;
    }, 0);
    const total = Number.isFinite(invoice.totalAmount)
      ? Number(invoice.totalAmount)
      : subtotal;
    const discount = Math.max(0, subtotal - total);

    return {
      subtotal,
      discount,
      total,
    };
  }, [invoice]);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoiceResponse, partsResponse] = await Promise.all([
          SalesInvoiceApi.getSalesInvoiceByIdApi(invoiceId),
          PartApi.getAllPartsApi(),
        ]);

        setInvoice(invoiceResponse.data ?? null);
        setParts(partsResponse.data ?? []);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? "Failed to load invoice details.");
        } else {
          toast.error("Failed to load invoice details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <CustomerSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <CustomerNavbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Invoice details</h2>
                <p className="text-sm text-muted-foreground">
                  Review the items and totals for this order.
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate("/customer/parts")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to orders
              </Button>
            </div>

            {isLoading ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  Loading invoice details...
                </CardContent>
              </Card>
            ) : !invoice ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  Invoice not found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Invoice #{invoice.id}</CardTitle>
                      <CardDescription>
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        Rs. {invoiceTotals?.subtotal.toFixed(2) ?? "0.00"}
                      </span>
                    </div>
                    {invoiceTotals?.discount ? (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium">
                          - Rs. {invoiceTotals.discount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">
                        Rs. {invoiceTotals?.total.toFixed(2) ?? "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{invoice.items?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Credit sale</span>
                      <span className="font-medium">{invoice.isCredit ? "Yes" : "No"}</span>
                    </div>
                    {invoice.isCredit ? (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Due date</span>
                        <span className="font-medium">
                          {invoice.creditDueDate
                            ? new Date(invoice.creditDueDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Line items</CardTitle>
                    <CardDescription>Parts included in this invoice.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(invoice.items ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">No line items found.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="px-4 py-3 text-left font-semibold">Part</th>
                              <th className="px-4 py-3 text-right font-semibold">Qty</th>
                              <th className="px-4 py-3 text-right font-semibold">Unit price</th>
                              <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(invoice.items ?? []).map((item) => {
                              const part = partById.get(item.partId);
                              const label = part ? `${part.name} (${part.sku})` : `Part #${item.partId}`;
                              const subTotal = item.subTotal ?? item.unitPrice * item.partQuantity;

                              return (
                                <tr
                                  key={`${invoice.id}-${item.partId}-${item.id ?? "item"}`}
                                  className="border-b hover:bg-muted/30 transition-colors"
                                >
                                  <td className="px-4 py-3 font-medium">{label}</td>
                                  <td className="px-4 py-3 text-right">{item.partQuantity}</td>
                                  <td className="px-4 py-3 text-right">
                                    Rs. {item.unitPrice.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    Rs. {subTotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
