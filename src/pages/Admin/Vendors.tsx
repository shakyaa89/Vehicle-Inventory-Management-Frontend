import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VendorApi } from "@/constants/Api";
import type { Vendor, VendorData } from "@/types/vendor";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(true);
    const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
    const [deletingVendorId, setDeletingVendorId] = useState<number | null>(null);
    const [editingVendorId, setEditingVendorId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");

    const resetForm = () => {
        setName("");
        setContact("");
        setAddress("");
        setEmail("");
        setEditingVendorId(null);
    };

    const openDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const fetchVendors = async () => {
        try {
            setIsLoadingVendors(true);
            const response = await VendorApi.getAllVendorsApi();
            setVendors(response.data);
        } catch (error) {
            toast.error("Failed to load vendors");
            console.error(error);
        } finally {
            setIsLoadingVendors(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !contact.trim()) {
            toast.error("Name and contact are required");
            return;
        }

        try {
            setIsSubmittingVendor(true);
            const vendorData: VendorData = { name, contact, address, email };

            if (editingVendorId) {
                await VendorApi.updateVendorApi(editingVendorId, vendorData);
                setVendors(
                    vendors.map((v) =>
                        v.id === editingVendorId
                            ? { ...v, ...vendorData }
                            : v
                    )
                );
                toast.success("Vendor updated successfully");
            } else {
                const response = await VendorApi.addVendorApi(vendorData);
                setVendors([...vendors, response.data]);
                toast.success("Vendor added successfully");
            }

            closeDialog();
        } catch (error) {
            toast.error("Failed to save vendor");
            console.error(error);
        } finally {
            setIsSubmittingVendor(false);
        }
    };

    const handleEdit = (vendor: Vendor) => {
        setEditingVendorId(vendor.id);
        setName(vendor.name);
        setContact(vendor.contact);
        setAddress(vendor.address);
        setEmail(vendor.email);
        setIsDialogOpen(true);
    };

    const handleDelete = async (vendorId: number) => {
        try {
            setDeletingVendorId(vendorId);
            await VendorApi.deleteVendorApi(vendorId);
            setVendors(vendors.filter((v) => v.id !== vendorId));
            toast.success("Vendor deleted successfully");
        } catch (error) {
            toast.error("Failed to delete vendor");
            console.error(error);
        } finally {
            setDeletingVendorId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />

            <main className="flex-1">
                <AdminNavbar />

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
                            <p className="text-muted-foreground">
                                Manage your vendor information and contacts.
                            </p>
                        </div>
                        <Button onClick={openDialog} size="lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vendor
                        </Button>
                    </div>

                    {/* Vendors Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendors List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingVendors ? (
                                <div className="flex justify-center items-center py-8">
                                    <p className="text-muted-foreground">Loading vendors...</p>
                                </div>
                            ) : vendors.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No vendors found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold">Contact</th>
                                                <th className="text-left py-3 px-4 font-semibold">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold">Address</th>
                                                <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.map((vendor) => (
                                                <tr
                                                    key={vendor.id}
                                                    className="border-b hover:bg-muted/50 transition-colors"
                                                >
                                                    <td className="py-3 px-4">{vendor.name}</td>
                                                    <td className="py-3 px-4">{vendor.contact}</td>
                                                    <td className="py-3 px-4">{vendor.email}</td>
                                                    <td className="py-3 px-4">{vendor.address}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(vendor)}
                                                                disabled={isSubmittingVendor || deletingVendorId !== null}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(vendor.id)}
                                                                disabled={isSubmittingVendor || deletingVendorId === vendor.id}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
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

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingVendorId ? "Edit Vendor" : "Add New Vendor"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Vendor Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter vendor name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact">Contact</Label>
                            <Input
                                id="contact"
                                placeholder="Enter contact number"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Enter address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={isSubmittingVendor}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmittingVendor}>
                                {isSubmittingVendor
                                    ? "Saving..."
                                    : editingVendorId
                                      ? "Update Vendor"
                                      : "Add Vendor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
