import { Logo } from "@/components/logo/logo"
import { Link } from "react-router-dom"

const groups = [
  {
    title: "Product",
    items: [
      { href: "/admin", label: "Admin Dashboard" },
      { href: "/staff", label: "Staff Console" },
      { href: "/portal", label: "Customer Portal" },
      { href: "/admin/ai-insights", label: "AI Insights" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "Service Centers" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "Help Center" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
      { href: "#", label: "Security" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            The modern operating system for vehicle parts retail and service center management.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="mb-4 text-sm font-semibold">{g.title}</h4>
            <ul className="space-y-2">
              {g.items.map((i) => (
                <li key={i.label}>
                  <Link
                    to={i.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>© {new Date().getFullYear()} VMS. All rights reserved.</p>
          <p>Built for service centers, parts dealers, and fleet operators.</p>
        </div>
      </div>
    </footer>
  )
}
