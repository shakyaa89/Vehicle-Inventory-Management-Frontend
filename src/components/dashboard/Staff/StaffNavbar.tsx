import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "../../ui/input";
import { useAuthStore } from "@/store/authStore";

export default function StaffNavbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background px-8">
      <div className="relative hidden flex-1 md:block md:max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks, appointments, parts..." className="h-9 pl-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/staff/dashboard">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>

        <div className="hidden md:flex flex-col">
          <span className="text-xs font-medium">{user?.fullName}</span>
          <span className="text-[11px] text-muted-foreground">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
