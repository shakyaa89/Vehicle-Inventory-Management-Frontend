import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Car, ChevronRight, IdCard, Mail, Phone, UserCircle2, UserPlus } from "lucide-react";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AuthApi, VehicleApi } from "@/constants/Api";
import type { CustomerStats } from "@/types/auth";
import type { Vehicle } from "@/types/vehicle";
import { Link } from "react-router-dom";

export default function StaffCustomersPage() {
    const [customers, setCustomers] = useState<CustomerStats[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
    const [search, setSearch] = useState("");

    const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null;

    const query = search.trim().toLowerCase();
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const fetchCustomers = async () => {
        try {
            setIsLoadingCustomers(true);
            const response = await AuthApi.getCustomersApi(debouncedQuery);
            const customerList = response.data ?? [];
            setCustomers(customerList);

            if (customerList.length > 0) {
                setSelectedCustomerId((current) => current ?? customerList[0].id);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Failed to load customers");
            } else {
                toast.error("Failed to load customers");
            }
            console.error(error);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const fetchVehicles = async (customerId: number) => {
        try {
            setIsLoadingVehicles(true);
            const response = await VehicleApi.getVehiclesByCustomerApi(customerId);
            setSelectedVehicles(response.data ?? []);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Failed to load vehicles");
            } else {
                toast.error("Failed to load vehicles");
            }
            console.error(error);
            setSelectedVehicles([]);
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        fetchCustomers();
    }, [debouncedQuery]);

    useEffect(() => {
        if (!selectedCustomerId) {
            setSelectedVehicles([]);
            return;
        }

        fetchVehicles(selectedCustomerId);
    }, [selectedCustomerId]);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <StaffSidebar />

            <div className="flex flex-1 flex-col min-w-0">
                <StaffNavbar />

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Front desk tools</p>
                                <h2 className="text-2xl font-semibold tracking-tight">Customer Directory</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    View customer details and their registered vehicles.
                                </p>
                            </div>

                            <Button asChild>
                                <Link to="/staff/customers/register">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Register customer
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Customers</CardTitle>
                                    <CardDescription>Search and select a customer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        placeholder="Search by name, email, username..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />

                                    {isLoadingCustomers ? (
                                        <p className="text-sm text-muted-foreground">Loading customers...</p>
                                    ) : customers.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No customers found.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {customers.map((customer) => {
                                                const active = customer.id === selectedCustomerId;

                                                return (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => setSelectedCustomerId(customer.id)}
                                                        className={`w-full rounded-xl border p-4 text-left transition-colors ${active
                                                                ? "border-primary bg-primary/5"
                                                                : "hover:bg-muted/40"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">{customer.fullName}</p>
                                                                <p className="text-xs text-muted-foreground">@{customer.userName}</p>
                                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Customer details</CardTitle>
                                        <CardDescription>Selected customer profile information</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedCustomer ? (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="rounded-xl border bg-card p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            <UserCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{selectedCustomer.fullName}</p>
                                                            <p className="text-xs text-muted-foreground">Customer ID #{selectedCustomer.id}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border bg-card p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <IdCard className="h-4 w-4 text-muted-foreground" />
                                                        <span>{selectedCustomer.userName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span>{selectedCustomer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>{selectedCustomer.phoneNumber || "No phone number on file"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                                Select a customer to view their profile.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Vehicles</CardTitle>
                                        <CardDescription>Registered vehicles for the selected customer</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedCustomer ? (
                                            isLoadingVehicles ? (
                                                <p className="text-sm text-muted-foreground">Loading vehicles...</p>
                                            ) : selectedVehicles.length === 0 ? (
                                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                                    No vehicles registered for this customer.
                                                </div>
                                            ) : (
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {selectedVehicles.map((vehicle) => (
                                                        <div key={vehicle.id} className="rounded-xl border bg-card p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                        <Car className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Plate: {vehicle.vehicleNumber}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="secondary">Active</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                                Select a customer to view their vehicles.
                                            </div>
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
