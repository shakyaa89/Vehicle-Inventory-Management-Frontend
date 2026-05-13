import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Calendar,
  Car,
  LayoutDashboard,
  LogOut,
  Star,
  History,
  Package,
  ShoppingCart
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Logo } from "../../logo/logo";
import { useAuthStore } from "@/store/authStore";
import { Button } from "../../ui/button";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const sections = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/customer/dashboard",
        icon: LayoutDashboard
      },
      {
        label: "My vehicles",
        href: "/customer/vehicles",
        icon: Car
      }
    ]
  },
  {
    title: "Service",
    items: [
      {
        label: "Appointments",
        href: "/customer/appointments",
        icon: Calendar
      },
      {
        label: "Buy parts",
        href: "/customer/parts",
        icon: ShoppingCart
      },
      {
        label: "Part requests",
        href: "/customer/part-requests",
        icon: Package
      },
      {
        label: "Reviews",
        href: "/customer/reviews",
        icon: Star
      }
    ]
  },
  {
    title: "Inbox",
    items: [
      {
        label: "Notifications",
        href: "/customer/notifications",
        icon: Bell
      }
    ]
  }
];

export default function CustomerSidebar() {
  const location = useLocation();

  const {logout} = useAuthStore();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4">
            <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, idx) => (
            <div key={idx} className={cn(idx > 0 && "mt-6")}>
              {section.title && (
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location.pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <Button
            onClick={logout}
            className="flex items-center gap-2 rounded-md p-2 text-xs font-medium cursor-pointer w-full"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}