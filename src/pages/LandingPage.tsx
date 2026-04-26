import {
  Boxes,
  LineChart,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wrench,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/layout/footer"
import { Link } from "react-router-dom"
import {Navbar} from "@/components/layout/navbar"

const features = [
  {
    icon: Boxes,
    title: "Smart Inventory",
    description:
      "Track every part, SKU, and bin in real time with low-stock alerts and reorder suggestions.",
  },
  {
    icon: Wrench,
    title: "Service Operations",
    description:
      "Manage appointments, work orders, and technician assignments from a unified workspace.",
  },
  {
    icon: Sparkles,
    title: "AI Predictive Maintenance",
    description:
      "Anticipate part failures and recommend replacements based on vehicle health signals.",
  },
  {
    icon: Truck,
    title: "Vendor & Procurement",
    description:
      "Streamline purchase orders, vendor relationships, and stock replenishment workflows.",
  },
  {
    icon: Users,
    title: "Customer Portal",
    description:
      "Give customers a self-service hub for vehicles, appointments, and purchase history.",
  },
  {
    icon: LineChart,
    title: "Financial Reporting",
    description:
      "Beautiful dashboards for revenue, margins, and inventory turnover at a glance.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
          <div className="flex flex-col gap-6">
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              The operating system for{" "}
              <span className="text-accent">vehicle parts</span> & service centers.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              VMS unifies inventory, point-of-sale, customer engagement, and predictive
              maintenance into one polished workspace built for modern auto businesses.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 px-5">
                <Link to="/register">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border shadow-lg">
              <img
                src="https://shop.battlegarage-rs.com/cdn/shop/collections/AE86T_Manga_Stage_1.webp?v=1663721358&width=950"
                alt="Modern auto service center"
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mb-12">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl text-center">
              Everything your service center needs, in one place.
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground text-center">
              Replace spreadsheets, paper invoices, and disconnected tools with a single workspace
              for parts, service, and customers.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built for every role</h2>
            <p className="text-muted-foreground">Three tailored experiences, one source of truth.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Admins",
                desc: "Run the business with revenue, inventory, and team controls.",
                href: "/admin",
                icon: ShieldCheck,
              },
              {
                title: "Staff",
                desc: "Sell parts, register customers, and process invoices fast.",
                href: "/staff",
                icon: Wrench,
              },
              {
                title: "Customers",
                desc: "Self-serve appointments, vehicles, and purchase history.",
                href: "/portal",
                icon: Users,
              },
            ].map((r) => (
              <Card key={r.title} className="group relative overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{r.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <Card className="overflow-hidden border-border bg-primary text-primary-foreground">
            <CardContent className="grid gap-6 p-10 md:grid-cols-[1fr_auto] md:items-center md:p-14">
              <div>
                <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
                  Ready to modernize your servicing?
                </h3>
                <p className="mt-2 max-w-2xl text-primary-foreground/70">
                  Get started in minutes. 
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
