import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import StaffSidebar from "@/components/dashboard/Staff/StaffSidebar";
import StaffNavbar from "@/components/dashboard/Staff/StaffNavbar";
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
import { AuthApi, VehicleApi } from "@/constants/Api";
import type { CustomerStats, UserRegisterData } from "@/types/auth";
import type { VehicleData } from "@/types/vehicle";

export default function StaffCustomerRegistration() {
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customers, setCustomers] = useState<CustomerStats[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
    const currentYear = new Date().getFullYear();
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState(currentYear);
    const [vehicleNumber, setVehicleNumber] = useState("");

    const resetCustomerForm = () => {
        setUserName("");
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
    };

    const resetVehicleForm = () => {
        setMake("");
        setModel("");
        setYear(currentYear);
        setVehicleNumber("");
    };

    const fetchCustomers = async () => {
        try {
            setIsLoadingCustomers(true);
            const response = await AuthApi.getCustomersApi();
            const customerList = response.data ?? [];
            setCustomers(customerList);

            if (customerList.length === 0) {
                setSelectedCustomerId(null);
                return;
            }

            setSelectedCustomerId((current) => current ?? customerList[0].id);
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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleCustomerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userName.trim() || !fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
            toast.error("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload: UserRegisterData = {
                userName,
                fullName,
                email,
                password,
                phoneNumber,
            };

            await AuthApi.registerCustomerApi(payload);
            toast.success("Customer registered successfully");
            resetCustomerForm();
            await fetchCustomers();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Failed to register customer");
            } else {
                toast.error("Failed to register customer");
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVehicleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomerId) {
            toast.error("Select a customer before registering a vehicle");
            return;
        }

        if (!make.trim() || !model.trim() || !vehicleNumber.trim()) {
            toast.error("All vehicle fields are required");
            return;
        }

        const payload: VehicleData = {
            customerId: selectedCustomerId,
            make,
            model,
            year: Number(year),
            vehicleNumber,
        };

        try {
            setIsSubmittingVehicle(true);
            await VehicleApi.addVehicleApi(payload);
            toast.success("Vehicle registered successfully");
            resetVehicleForm();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Failed to register vehicle");
            } else {
                toast.error("Failed to register vehicle");
            }
            console.error(error);
        } finally {
            setIsSubmittingVehicle(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <StaffSidebar />

            <div className="flex flex-1 flex-col min-w-0">
                <StaffNavbar />

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Staff tools</p>
                                <h2 className="text-2xl font-semibold tracking-tight">Register Customer</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create a new customer account from the front desk.
                                </p>
                            </div>

                            <Button variant="outline" disabled={isSubmitting} onClick={resetCustomerForm}>
                                Reset form
                            </Button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <CardTitle>Customer Registration</CardTitle>
                                            <CardDescription>
                                                Fill in the details below to create a customer account.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={handleCustomerSubmit} className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Customer full name"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="userName">Username</Label>
                                        <Input
                                            id="userName"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="customer.username"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="customer@example.com"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="0771234567"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={resetCustomerForm} disabled={isSubmitting}>
                                            Clear
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Registering..." : "Register Customer"}
                                        </Button>
                                    </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Register Vehicle</CardTitle>
                                    <CardDescription>
                                        Select a customer and register their vehicle.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={handleVehicleSubmit} className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="customer">Customer</Label>
                                        <Select
                                            value={selectedCustomerId ? String(selectedCustomerId) : ""}
                                            onValueChange={(value) => setSelectedCustomerId(Number(value))}
                                            disabled={isLoadingCustomers || customers.length === 0}
                                        >
                                            <SelectTrigger className="w-full" id="customer">
                                                <SelectValue
                                                    placeholder={isLoadingCustomers ? "Loading customers..." : "Select a customer"}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={String(customer.id)}>
                                                            {customer.fullName} - @{customer.userName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="make">Make</Label>
                                        <Input
                                            id="make"
                                            value={make}
                                            onChange={(e) => setMake(e.target.value)}
                                            placeholder="Toyota"
                                            disabled={isSubmittingVehicle}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="model">Model</Label>
                                        <Input
                                            id="model"
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            placeholder="Corolla"
                                            disabled={isSubmittingVehicle}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="year">Year</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            min={1886}
                                            max={9999}
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                            disabled={isSubmittingVehicle}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                                        <Input
                                            id="vehicleNumber"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value)}
                                            placeholder="BA 01 PA 1234"
                                            disabled={isSubmittingVehicle}
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={resetVehicleForm} disabled={isSubmittingVehicle}>
                                            Clear
                                        </Button>
                                        <Button type="submit" disabled={isSubmittingVehicle}>
                                            {isSubmittingVehicle ? "Registering..." : "Register Vehicle"}
                                        </Button>
                                    </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
