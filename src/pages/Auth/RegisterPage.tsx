import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo/logo"
import { AuthApi } from "@/constants/Api"
import type { UserRegisterData } from "@/types/auth"

export default function RegisterPage() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setUserName("")
        setFullName("")
        setEmail("")
        setPhoneNumber("")
        setPassword("")
        setConfirmPassword("")
        setTermsAccepted(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userName.trim() || !fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
            toast.error("All fields are required")
            return
        }

        if (!termsAccepted) {
            toast.error("You must accept the terms to continue")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setIsSubmitting(true)

            const payload: UserRegisterData = {
                userName,
                fullName,
                email,
                password,
                phoneNumber,
            }

            await AuthApi.registerCustomerApi(payload)
            toast.success("Account created successfully. Please sign in.")
            resetForm()
            navigate("/login")
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || error.message || "Registration failed")
            } else {
                toast.error("Registration failed")
            }
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden lg:block">
                <img
                    src=""
                    alt="Organized auto parts on warehouse shelves"
                    className="h-full w-full object-cover"
                />

                {/* <div className="absolute inset-0 bg-linear-to-tr from-primary/80 via-primary/40 to-transparent" /> */}
                <div className="absolute inset-0 bg-purple-900" />
            </div>
            <div className="flex flex-col p-6 md:p-10">
                <Logo />

                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create your account
                        </h1>

                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Spin up a workspace for your service center in under a minute.
                        </p>

                        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Shashwat"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="userName">Username</Label>
                                <Input
                                    id="userName"
                                    placeholder="Shakyaa"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="shakyaa@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phoneNumber">Phone number</Label>
                                <Input
                                    id="phoneNumber"
                                    placeholder="0771234567"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>



                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="terms"
                                    className="mt-0.5"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                                    disabled={isSubmitting}
                                />

                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal leading-relaxed text-muted-foreground"
                                >
                                    I agree to the VMS Terms of Service and Privacy Policy.
                                </Label>
                            </div>

                            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Creating account..." : "Create account"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>

                        <p className="mt-4 text-xs text-muted-foreground text-center">
                            By continuing, you agree to our Terms and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>


        </div>
    )
}