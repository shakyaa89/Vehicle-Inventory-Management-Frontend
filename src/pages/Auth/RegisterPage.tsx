import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo/logo"

export default function RegisterPage() {
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

                        <form className="mt-8 grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullname">Full name</Label>
                                <Input id="fullname" placeholder="Shashwat" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="Shakyaa" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="shakyaa@gmail.com"
                                />
                            </div>



                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox id="terms" className="mt-0.5" />

                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal leading-relaxed text-muted-foreground"
                                >
                                    I agree to the VMS Terms of Service and Privacy Policy.
                                </Label>
                            </div>

                            <Button type="button" size="lg" className="w-full">
                                Create account
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