import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Logo, TSButton } from "./primitives";

export function SiteNav() {
  const [light, setLight] = useState(false);
  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    document.documentElement.classList.toggle("dark", !next);
  };
  return (
    <header className="glass sticky top-0 z-40 border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link to="/" aria-label="TabSprint home"><Logo /></Link>
        <div className="hidden flex-1 gap-6 text-sm text-text-secondary md:flex">
          <a href="/#product" className="hover:text-foreground">Product</a>
          <a href="/#industries" className="hover:text-foreground">Industries</a>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/pos" className="hover:text-foreground">Demo</Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-raised">
            {light ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}
          </button>
          <Link to="/pos"><TSButton>Start free</TSButton></Link>
        </div>
      </nav>
    </header>
  );
}
