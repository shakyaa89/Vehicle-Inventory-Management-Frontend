import { cn } from "@/lib/utils"
import { Cog } from "lucide-react"
import { Link } from "react-router-dom"

interface LogoProps {
  className?: string
  href?: string
  invert?: boolean
}

export function Logo({ className, href = "/", invert = false }: LogoProps) {
  return (
    <Link
      to={href}
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
      aria-label="VMS home"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md",
          invert ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Cog className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={cn("text-base", invert && "text-primary-foreground")}>
        VMS
      </span>
    </Link>
  )
}
