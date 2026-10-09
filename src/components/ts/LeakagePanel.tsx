import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Leak } from "@/data/venues";
import { useVenue } from "@/store/venue";
import { cn } from "@/lib/utils";
import { Money, TSButton } from "./primitives";

export function LeakagePanel() {
  const v = useVenue();
  const [open, setOpen] = useState<Leak | null>(null);
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
      <ul className="divide-y rounded-md border">
        {v.leaks.map((l) => {
          const severe = l.kind === "Void after payment" || l.kind === "Cash mismatch";
          return (
            <li key={l.id} className="flex items-center gap-3 p-3">
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", severe ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning")}>{severe ? "High" : "Watch"}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{l.kind}</div>
                <div className="text-sm text-muted-foreground">{l.staff} · {l.order} · {l.minsAgo}m ago</div>
              </div>
              {l.amount > 0 && <Money value={l.amount} className="font-semibold" />}
              <TSButton variant="secondary" onClick={() => setOpen(l)}>Investigate</TSButton>
            </li>
          );
        })}
      </ul>
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Risk score by staff</h3>
        <ul className="mt-3 space-y-3">
          {v.staff.map((s) => (
            <li key={s.id}>
              <div className="flex justify-between text-sm"><span>{s.name}</span><span className="font-mono tnum">{s.risk}</span></div>
              <div className="mt-1 h-2 rounded-full bg-raised">
                <div className={cn("h-full rounded-full", s.risk >= 70 ? "bg-danger" : s.risk >= 40 ? "bg-warning" : "bg-success")} style={{ width: `${s.risk}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="border-l bg-card">
          {open && (
            <>
              <SheetHeader><SheetTitle className="font-display text-xl">{open.kind}</SheetTitle></SheetHeader>
              <div className="px-4 text-sm text-text-secondary">{open.staff} · {open.order}{open.amount > 0 && <> · <Money value={open.amount} /></>}</div>
              <ol className="mt-6 space-y-5 border-l border-border pl-5 mx-4">
                {open.timeline.map(([t, e], i) => (
                  <li key={i} className="relative">
                    <span className={cn("absolute -left-[27px] top-1 h-3 w-3 rounded-full", i === open.timeline.length - 1 ? "bg-danger" : "bg-raised border")} />
                    <div className="font-mono text-xs text-muted-foreground tnum">{t}</div>
                    <div>{e}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex gap-2 px-4">
                <TSButton variant="secondary" className="flex-1" onClick={() => setOpen(null)}>Dismiss</TSButton>
                <TSButton className="flex-1" onClick={() => setOpen(null)}>Flag for review</TSButton>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
