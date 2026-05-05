import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ShieldPlus } from "lucide-react";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthApi } from "@/constants/Api";
import type { UserRegisterData } from "@/types/auth";

export default function StaffRegistrationPage() {
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setUserName("");
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

            await AuthApi.registerStaffApi(payload);
            toast.success("Staff member registered successfully");
            resetForm();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Failed to register staff");
            } else {
                toast.error("Failed to register staff");
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />

            <main className="flex-1">
                <AdminNavbar />

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Staff Registration</h2>
                            <p className="text-muted-foreground">
                                Create staff accounts that can access the staff dashboard.
                            </p>
                        </div>
                    </div>

                    <Card className="max-w-3xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ShieldPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>New Staff Member</CardTitle>
                                    <CardDescription>
                                        Fill in the account details below to create a staff login.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="userName">Username</Label>
                                    <Input
                                        id="userName"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="staff.username"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Staff Member Name"
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
                                        placeholder="staff@example.com"
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
                                    <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                                        Reset
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Registering..." : "Register Staff"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
