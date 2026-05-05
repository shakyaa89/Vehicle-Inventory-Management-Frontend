import AdminTopbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PartApi } from "@/constants/Api";
import type { Part, PartData } from "@/types/part";
import { AxiosError } from "axios";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PartsPage() {
    const [parts, setParts] = useState<Part[]>([]);
    const [isLoadingParts, setIsLoadingParts] = useState(false);
    const [isSubmittingPart, setIsSubmittingPart] = useState(false);
    const [deletingPartId, setDeletingPartId] = useState<number | null>(null);
    const [editingPartId, setEditingPartId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [price, setPrice] = useState(0);
    const [stockQuantity, setStockQuantity] = useState(0);

    const resetForm = () => {
        setName("");
        setSku("");
        setPrice(0);
        setStockQuantity(0);
        setEditingPartId(null);
    };

    const openDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const fetchParts = async () => {
        setIsLoadingParts(true);
        try {
            const response = await PartApi.getAllPartsApi();
            setParts(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to fetch parts.");
            } else {
                toast.error("Failed to fetch parts.");
            }
        } finally {
            setIsLoadingParts(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name || !sku) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const data: PartData = {
            name,
            sku,
            price: Number(price),
            stockQuantity: Number(stockQuantity),
        };

        setIsSubmittingPart(true);
        try {
            if (editingPartId) {
                await PartApi.updatePartApi(editingPartId, data);
                toast.success("Part updated successfully.");
            } else {
                await PartApi.addPartApi(data);
                toast.success("Part added successfully.");
            }

            closeDialog();
            await fetchParts();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Unable to save part.");
            } else {
                toast.error("Unable to save part.");
            }
        } finally {
            setIsSubmittingPart(false);
        }
    };

    const handleEdit = (part: Part) => {
        setEditingPartId(part.id);
        setName(part.name);
        setSku(part.sku);
        setPrice(part.price);
        setStockQuantity(part.stockQuantity);
        setIsDialogOpen(true);
    };

    const handleDelete = async (partId: number) => {
        setDeletingPartId(partId);
        try {
            await PartApi.deletePartApi(partId);
            toast.success("Part deleted successfully.");
            setParts((prev) => prev.filter((part) => part.id !== partId));

            if (editingPartId === partId) {
                resetForm();
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Unable to delete part.");
            } else {
                toast.error("Unable to delete part.");
            }
        } finally {
            setDeletingPartId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <div className="flex flex-1 flex-col min-w-0">
                <AdminTopbar />

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Parts Inventory
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage your parts inventory and stock levels.
                                </p>
                            </div>

                            <Button type="button" onClick={openDialog} disabled={isSubmittingPart}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add part
                            </Button>
                        </div>

                        {/* Parts List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Parts List</CardTitle>
                            </CardHeader>

                            <CardContent>
                                {isLoadingParts ? (
                                    <div className="flex items-center justify-center py-8">
                                        <p className="text-muted-foreground">Loading parts...</p>
                                    </div>
                                ) : parts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Package className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                        <p className="text-muted-foreground">No parts added yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="px-4 py-3 text-left font-semibold">Part Name</th>
                                                    <th className="px-4 py-3 text-left font-semibold">SKU</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Stock</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parts.map((part) => (
                                                    <tr
                                                        key={part.id}
                                                        className="border-b hover:bg-muted/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-medium">{part.name}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{part.sku}</td>
                                                        <td className="px-4 py-3 text-right">Rs. {part.price.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-right">{part.stockQuantity}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEdit(part)}
                                                                    disabled={isSubmittingPart || deletingPartId !== null}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(part.id)}
                                                                    disabled={isSubmittingPart || deletingPartId === part.id}
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
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPartId ? "Edit Part" : "Add New Part"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPartId
                                ? "Update the part details below."
                                : "Fill in the details to add a new part to your inventory."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dialog-name">Part Name *</Label>
                            <Input
                                id="dialog-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmittingPart}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-sku">SKU *</Label>
                            <Input
                                id="dialog-sku"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                disabled={isSubmittingPart}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-price">Price (Rs.)</Label>
                            <Input
                                id="dialog-price"
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                disabled={isSubmittingPart}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialog-stockQuantity">Stock Quantity</Label>
                            <Input
                                id="dialog-stockQuantity"
                                type="number"
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(Number(e.target.value))}
                                disabled={isSubmittingPart}
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isSubmittingPart || !name || !sku}>
                                {isSubmittingPart ? "Saving..." : editingPartId ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
