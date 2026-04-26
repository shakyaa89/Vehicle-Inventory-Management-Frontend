import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo/logo"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Service Centers" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "Help" },
]

export function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === l.href && "text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user == null ? <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/register">Get started</Link>
            </Button>
          </> :
            <>
              <p className=
                "text-sm font-medium text-foreground transition-colors hover:text-foreground">
                Welcome, {user.fullName}
              </p>
              <Button size="sm" className="cursor-pointer">
                Logout
              </Button></>}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            <div className="mt-6 flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button asChild variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}