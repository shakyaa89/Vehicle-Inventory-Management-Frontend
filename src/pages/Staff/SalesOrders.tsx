import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthApi, SalesInvoiceApi } from "@/constants/Api";
import type { CustomerStats } from "@/types/auth";
import type { SalesInvoiceData } from "@/types/salesInvoice";

export default function StaffSalesOrdersPage() {
  const [invoices, setInvoices] = useState<SalesInvoiceData[]>([]);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<number | null>(null);

  const customerById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.fullName]));
  }, [customers]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoiceResponse, customerResponse] = await Promise.all([
          SalesInvoiceApi.getSalesInvoicesApi(),
          AuthApi.getCustomersApi(),
        ]);

        setInvoices(invoiceResponse.data ?? []);
        setCustomers(customerResponse.data ?? []);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? "Failed to load sales orders.");
        } else {
          toast.error("Failed to load sales orders.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendEmail = async (invoiceId?: number) => {
    if (!invoiceId) {
      toast.error("Invoice id is missing.");
      return;
    }

    setSendingInvoiceId(invoiceId);
    try {
      await SalesInvoiceApi.sendSalesInvoiceEmailApi(invoiceId);
      toast.success("Invoice email sent.");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to send invoice email.");
      } else {
        toast.error("Failed to send invoice email.");
      }
    } finally {
      setSendingInvoiceId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StaffSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <StaffNavbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Sales orders</h2>
              <p className="text-sm text-muted-foreground">
                Review orders placed by customers.
              </p>
            </div>

            {isLoading ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  Loading sales orders...
                </CardContent>
              </Card>
            ) : invoices.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  No sales orders found.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-semibold">Order</th>
                          <th className="px-4 py-3 text-left font-semibold">Date</th>
                          <th className="px-4 py-3 text-left font-semibold">Customer</th>
                          <th className="px-4 py-3 text-right font-semibold">Items</th>
                          <th className="px-4 py-3 text-right font-semibold">Total</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => {
                          const customerName =
                            customerById.get(Number(invoice.customerId)) ??
                            `Customer #${invoice.customerId}`;
                          const isSending = sendingInvoiceId === invoice.id;

                          return (
                            <tr
                              key={invoice.id ?? `${invoice.customerId}-${invoice.createdAt}`}
                              className="border-b hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium">#{invoice.id}</td>
                              <td className="px-4 py-3">
                                {invoice.createdAt
                                  ? new Date(invoice.createdAt).toLocaleString()
                                  : "Date unavailable"}
                              </td>
                              <td className="px-4 py-3">{customerName}</td>
                              <td className="px-4 py-3 text-right">
                                {invoice.items?.length ?? 0}
                              </td>
                              <td className="px-4 py-3 text-right">
                                Rs. {invoice.totalAmount?.toFixed(2) ?? "0.00"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendEmail(invoice.id)}
                                  disabled={!invoice.id || isSending}
                                >
                                  {isSending ? "Sending..." : "Send Email"}
                                </Button>
                              </td>
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
