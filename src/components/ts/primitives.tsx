import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "pos";
};

export function TSButton({ variant = "primary", size = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[transform,box-shadow,background] duration-[120ms] disabled:opacity-40 disabled:pointer-events-none select-none",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-14 px-7 text-base",
        size === "pos" && "h-14 px-6 text-base min-w-14",
        variant === "primary" && "btn-volt",
        variant === "secondary" && "btn-ink",
        variant === "ghost" && "text-text-secondary hover:bg-raised hover:text-foreground",
        variant === "danger" && "bg-danger/15 text-danger hover:bg-danger/25",
        className,
      )}
    />
  );
}

export function TSCard({ className, raised, ...p }: HTMLAttributes<HTMLDivElement> & { raised?: boolean }) {
  return (
    <div
      {...p}
      className={cn(
        "rounded-lg border",
        raised ? "bg-raised elev-2" : "bg-card elev-1",
        className,
      )}
    />
  );
}

export function Chip({
  active,
  tone = "neutral",
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; tone?: "neutral" | "ember" | "success" | "warning" | "danger" | "info" }) {
  const tones: Record<string, string> = {
    neutral: "",
    ember: "bg-ember/15 text-ember border-ember/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-danger/15 text-danger border-danger/30",
    info: "bg-info/15 text-info border-info/30",
  };
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors duration-[120ms]",
        active ? "border-volt bg-volt text-ink-on-volt" : tone === "neutral" ? "bg-raised text-text-secondary hover:text-foreground" : tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Money({ value, symbol = "₹", className }: { value: number; symbol?: string; className?: string }) {
  return (
    <span className={cn("font-mono tnum", className)}>
      <span className="mr-0.5 text-[0.8em] font-normal opacity-70">{symbol}</span>
      {value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
    </span>
  );
}

export function Stat({ label, value, delta, children }: { label: string; value: ReactNode; delta?: number; children?: ReactNode }) {
  return (
    <TSCard className="p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-[28px] font-semibold">{value}</div>
      {delta !== undefined && (
        <div className={cn("mt-1 text-sm font-mono tnum", delta >= 0 ? "text-success" : "text-danger")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last week
        </div>
      )}
      {children}
    </TSCard>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-lg font-bold", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-volt" />
        <path d="M8 8h16v5h-5.5L16 25h-5l2.5-12H8z" className="fill-ink-on-volt" />
        <path d="M21 14l-6 13" stroke="currentColor" className="stroke-volt" strokeWidth="2.2" />
      </svg>
      TabSprint
    </span>
  );
}

export function Monogram({ name, hue }: { name: string; hue: number }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center rounded-md font-display text-2xl font-bold"
      style={{ background: `oklch(0.32 0.06 ${hue})`, color: `oklch(0.9 0.08 ${hue})` }}
    >
      {initials}
    </div>
  );
}

export function VegDot({ veg }: { veg: boolean }) {
  return (
    <span
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={cn("inline-flex h-4 w-4 items-center justify-center rounded-[3px] border-2", veg ? "border-success" : "border-danger")}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-success" : "bg-danger")} />
    </span>
  );
}
