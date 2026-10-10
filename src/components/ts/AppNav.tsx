import { Link } from "@tanstack/react-router";
import { ChefHat, LayoutGrid, QrCode, Settings, ShoppingBag, BarChart3, BookOpen } from "lucide-react";
import { venues } from "@/data/venues";
import { useVenueStore } from "@/store/venue";
import { Logo } from "./primitives";

export function VenueSwitcher() {
  const id = useVenueStore((s) => s.venueId);
  const set = useVenueStore((s) => s.setVenue);
  return (
    <label className="flex h-11 shrink-0 items-center rounded-md border bg-raised px-2 text-sm">
      <span className="sr-only">Demo venue</span>
      <select value={id} onChange={(e) => set(e.target.value)} className="h-full bg-transparent pr-1 font-medium outline-none">
        {venues.map((v) => <option key={v.id} value={v.id} className="bg-card">{v.name} · {v.city}</option>)}
      </select>
    </label>
  );
}

const links = [
  { to: "/pos", label: "POS", icon: ShoppingBag },
  { to: "/menu", label: "Menu", icon: BookOpen },
  { to: "/tables", label: "Tables", icon: LayoutGrid },
  { to: "/kds", label: "Kitchen", icon: ChefHat },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3, BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppNav({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-panel px-3 md:px-4">
      <Link to="/" aria-label="Home" className="hidden sm:block"><Logo className="text-base" /></Link>
      <nav className="flex flex-1 gap-1 overflow-x-auto md:ml-4">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-text-secondary hover:bg-raised hover:text-foreground"
            activeProps={{ className: "bg-raised !text-foreground" }}>
            <Icon size={20} strokeWidth={1.75} /><span className="hidden md:inline">{label}</span>
          </Link>
        ))}
        <Link to="/qr/$table" params={{ table: "T4" }} className="flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-text-secondary hover:bg-raised hover:text-foreground">
          <QrCode size={20} strokeWidth={1.75} /><span className="hidden md:inline">Guest QR</span>
        </Link>
      </nav>
      {right}
      <VenueSwitcher />
    </header>
  );
}
