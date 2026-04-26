import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo/logo"
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const {login} = useAuthStore();


	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {

			if (!username || !password) {
				toast.error("Please enter email and password");
				return;
			}

			await login(username, password);

		} catch (error: any) {
			if (error?.response?.data?.message) {
				return toast.error(error?.response?.data?.message)
			} else {
				toast.error("An error occurred!")
			}
			console.log(error.response)
		}
	};

	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			{/* Right side */}
			<div className="relative hidden lg:block">
				<img
					src="https://lifehacker.com/imagery/articles/01HVKXTBCQ8N3FBRA73W788E7E/hero-image.fill.size_1248x702.v1713295153.jpg"
					alt="Organized auto parts on warehouse shelves"
					className="h-full w-full object-cover"
				/>

				<div className="absolute inset-0 bg-linear-to-tr from-primary/80 via-primary/40 to-transparent" />
			</div>

			{/* Left side */}
			<div className="flex flex-col p-6 md:p-10">
				<Logo />

				<div className="flex flex-1 items-center justify-center py-10">
					<div className="w-full max-w-sm">
						<h1 className="text-2xl font-semibold tracking-tight">
							Welcome back
						</h1>
						<p className="mt-1.5 text-sm text-muted-foreground">
							Sign in to your VMS to continue.
						</p>

						<form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
							<div className="grid gap-2">
								<Label htmlFor="username">Username</Label>
								<Input onChange={(e) => setUsername(e.target.value)} id="username" type="text" placeholder="Shakyaa" />
							</div>

							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									<Link
										to="/forgot-password"
										className="text-xs text-muted-foreground hover:text-foreground"
									>
										Forgot?
									</Link>
								</div>
								<Input onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="••••••••" />
							</div>

							<div className="flex items-center gap-2">
								<Checkbox id="remember" />
								<Label
									htmlFor="remember"
									className="text-sm font-normal text-muted-foreground"
								>
									Remember me on this device
								</Label>
							</div>

							<Button type="submit" size="lg" className="w-full">
								Sign in
							</Button>

							<div className="relative my-2">
								<Separator />
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
									OR
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Button variant="outline" type="button">
									Google
								</Button>
								<Button variant="outline" type="button">
									Microsoft
								</Button>
							</div>
						</form>

						<p className="mt-6 text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link
								to="/register"
								className="font-medium text-foreground underline-offset-4 hover:underline"
							>
								Create one
							</Link>
						</p>

						<p className="mt-4 text-xs text-muted-foreground">
							By continuing, you agree to our Terms and Privacy Policy.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
