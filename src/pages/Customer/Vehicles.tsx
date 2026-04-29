import CustomerTopbar from "@/components/dashboard/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleApi } from "@/constants/Api";
import { useAuthStore } from "@/store/authStore";
import type { Vehicle, VehicleData } from "@/types/vehicle";
import { AxiosError } from "axios";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VehiclesPage() {
    const { user } = useAuthStore();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
    const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
    const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
    const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

    const customerId = Number(user?.id ?? 0);
    const currentYear = new Date().getFullYear();

    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState(currentYear);
    const [vehicleNumber, setVehicleNumber] = useState("");

    const resetForm = () => {
        setMake("");
        setModel("");
        setYear(currentYear);
        setVehicleNumber("");
        setEditingVehicleId(null);
    };

    const fetchVehicles = async () => {
        if (!customerId) return;

        setIsLoadingVehicles(true);
        try {
            const response = await VehicleApi.getVehiclesByCustomerApi(customerId);
            setVehicles(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to fetch vehicles.");
            } else {
                toast.error("Failed to fetch vehicles.");
            }
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    useEffect(() => {
        if (!customerId) return;

        fetchVehicles();
    }, [customerId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!customerId) {
            toast.error("Please log in again.");
            return;
        }

        const data: VehicleData = {
            customerId,
            make,
            model,
            year: Number(year),
            vehicleNumber,
        };

        setIsSubmittingVehicle(true);
        try {
            if (editingVehicleId) {
                await VehicleApi.updateVehicleApi(editingVehicleId, data);
                toast.success("Vehicle updated successfully.");
            } else {
                await VehicleApi.addVehicleApi(data);
                toast.success("Vehicle added successfully.");
            }

            resetForm();
            await fetchVehicles();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Unable to save vehicle.");
            } else {
                toast.error("Unable to save vehicle.");
            }
        } finally {
            setIsSubmittingVehicle(false);
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicleId(vehicle.id);
        setMake(vehicle.make);
        setModel(vehicle.model);
        setYear(vehicle.year);
        setVehicleNumber(vehicle.vehicleNumber);
    };

    const handleDelete = async (vehicleId: number) => {
        setDeletingVehicleId(vehicleId);
        try {
            await VehicleApi.deleteVehicleApi(vehicleId);
            toast.success("Vehicle deleted successfully.");
            setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));

            if (editingVehicleId === vehicleId) {
                resetForm();
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Unable to delete vehicle.");
            } else {
                toast.error("Unable to delete vehicle.");
            }
        } finally {
            setDeletingVehicleId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <CustomerSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <CustomerTopbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">My Vehicles</h2>
                                <p className="text-sm text-muted-foreground">
                                    Add, edit, and remove your registered vehicles.
                                </p>
                            </div>
                            <Button type="button" onClick={resetForm} disabled={isSubmittingVehicle}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add vehicle
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{editingVehicleId ? "Edit Vehicle" : "Add Vehicle"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="make">Make</Label>
                                            <Input
                                                id="make"
                                                value={make}
                                                onChange={(event) => setMake(event.target.value)}
                                                placeholder="Toyota"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="model">Model</Label>
                                            <Input
                                                id="model"
                                                value={model}
                                                onChange={(event) => setModel(event.target.value)}
                                                placeholder="Corolla"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year">Year</Label>
                                            <Input
                                                id="year"
                                                type="number"
                                                min={1886}
                                                max={9999}
                                                value={year}
                                                onChange={(event) => setYear(Number(event.target.value))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                                            <Input
                                                id="vehicleNumber"
                                                value={vehicleNumber}
                                                onChange={(event) => setVehicleNumber(event.target.value)}
                                                placeholder="BA 01 PA 1234"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button type="submit" disabled={isSubmittingVehicle || deletingVehicleId !== null}>
                                            {isSubmittingVehicle
                                                ? "Saving..."
                                                : editingVehicleId
                                                    ? "Update Vehicle"
                                                    : "Add Vehicle"}
                                        </Button>
                                        {editingVehicleId && (
                                            <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmittingVehicle}>
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {isLoadingVehicles ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    Loading vehicles...
                                </CardContent>
                            </Card>
                        ) : vehicles.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium">No vehicles added yet</p>
                                        <p className="text-sm text-muted-foreground">
                                            Use the form above to add your first vehicle.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {vehicles.map((vehicle) => (
                                    <Card key={vehicle.id}>
                                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        Plate: {vehicle.vehicleNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleEdit(vehicle)}
                                                    disabled={isSubmittingVehicle || deletingVehicleId !== null}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    disabled={isSubmittingVehicle || deletingVehicleId !== null}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {deletingVehicleId === vehicle.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}