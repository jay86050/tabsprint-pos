import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";
import { AppNav } from "@/components/ts/AppNav";
import { Chip, TSButton, TSCard } from "@/components/ts/primitives";
import type { Table, TableStatus } from "@/data/venues";
import { useVenue, useVenueStore } from "@/store/venue";
import { usePos } from "@/store/pos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tables")({
  head: () => ({
    meta: [
      { title: "Tables and floor — TabSprint" },
      { name: "description", content: "Live floor plan with table status, timers and one-tap ordering." },
      { property: "og:title", content: "Tables and floor — TabSprint" },
      { property: "og:description", content: "See every table's status and time at a glance." },
    ],
  }),
  component: Tables,
});

export const statusMeta: Record<TableStatus, { label: string; cls: string; dot: string }> = {
  free: { label: "Free", cls: "border-border bg-card text-text-secondary", dot: "bg-text-secondary" },
  seated: { label: "Seated", cls: "border-info/50 bg-info/10 text-info", dot: "bg-info" },
  ordered: { label: "Ordered", cls: "border-volt/50 bg-volt/10 text-volt-text", dot: "bg-volt" },
  bill: { label: "Bill requested", cls: "border-ember/60 bg-ember/15 text-ember", dot: "bg-ember" },
  cleaning: { label: "Needs cleaning", cls: "border-warning/50 bg-warning/10 text-warning", dot: "bg-warning" },
};

function Tables() {
  const venue = useVenue();
  const tables = useVenueStore((s) => s.tables[s.venueId] ?? []);
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState<Table | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 15e3); return () => clearInterval(i); }, []);
  const zones = [...new Set(tables.map((t) => t.zone))];

  return (
    <div className="flex min-h-dvh flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-bold">Floor</h1>
          <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
            {Object.entries(statusMeta).map(([k, m]) => (
              <span key={k} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-full", m.dot)} />{m.label} <span className="font-mono tnum">{tables.filter((t) => t.status === k).length}</span></span>
            ))}
          </div>
          <TSButton variant={edit ? "primary" : "secondary"} className="ml-auto" onClick={() => setEdit(!edit)}>{edit ? "Done editing" : "Edit layout"}</TSButton>
        </div>
        {tables.length === 0 ? (
          <TSCard className="mt-10 flex flex-col items-center p-12 text-center">
            <Truck size={40} strokeWidth={1.5} className="text-volt-text" />
            <h2 className="mt-4 text-xl font-semibold">{venue.name} runs on queue numbers</h2>
            <p className="mt-2 text-text-secondary">Food trucks don't need tables. Orders get a ticket number at the POS.</p>
          </TSCard>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {zones.map((z) => (
              <Zone key={z} name={z} tables={tables.filter((t) => t.zone === z)} edit={edit} now={now} onPick={setSel} />
            ))}
          </div>
        )}
      </main>
      {sel && <TableSheet t={tables.find((x) => x.id === sel.id)!} now={now} onClose={() => setSel(null)} />}
    </div>
  );
}

function Zone({ name, tables, edit, now, onPick }: { name: string; tables: Table[]; edit: boolean; now: number; onPick: (t: Table) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = useVenueStore((s) => s.moveTable);
  return (
    <TSCard className="p-4">
      <h2 className="mb-3 text-lg font-semibold">{name}</h2>
      <div ref={ref} className={cn("relative h-[340px] rounded-md bg-panel", edit && "outline-dashed outline-1 outline-volt/40")}>
        {tables.map((t) => {
          const m = statusMeta[t.status];
          const mins = Math.round((now - t.since) / 60e3);
          return (
            <motion.button
              key={t.id + t.x + t.y}
              drag={edit}
              dragMomentum={false}
              dragConstraints={ref}
              onDragEnd={(_, info) => {
                const box = ref.current!.getBoundingClientRect();
                move(t.id, Math.max(0, Math.min(80, t.x + (info.offset.x / box.width) * 100)), Math.max(0, Math.min(75, t.y + (info.offset.y / box.height) * 100)));
              }}
              onClick={() => !edit && onPick(t)}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className={cn("absolute flex h-24 w-24 flex-col items-center justify-center border-2 elev-1 transition-colors", t.round ? "rounded-full" : "rounded-lg", m.cls, edit && "cursor-grab")}
              aria-label={`Table ${t.n}, ${m.label}`}
            >
              <span className="font-display text-xl font-bold text-foreground">{t.n}</span>
              <span className="text-xs">{t.seats} seats</span>
              {t.status !== "free" && <span className={cn("font-mono text-xs tnum", mins > 45 && "font-semibold text-danger")}>{mins}m</span>}
            </motion.button>
          );
        })}
      </div>
    </TSCard>
  );
}

function TableSheet({ t, now, onClose }: { t: Table; now: number; onClose: () => void }) {
  const setStatus = useVenueStore((s) => s.setTableStatus);
  const navigate = useNavigate();
  const openOrder = () => {
    const pos = usePos.getState();
    const existing = pos.tabs.find((x) => x.name.endsWith(`Table ${t.n}`));
    if (existing) pos.setActive(existing.id); else pos.openTab(`Table ${t.n}`);
    if (t.status === "free" || t.status === "seated") setStatus(t.id, "ordered");
    navigate({ to: "/pos" });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 md:items-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }} onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal className="w-full max-w-md rounded-t-xl border bg-card p-6 elev-3 md:rounded-xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Table {t.n}</h2>
          <span className="text-sm text-text-secondary">{t.zone} · {t.seats} seats · <span className="font-mono tnum">{Math.round((now - t.since) / 60e3)}m</span></span>
        </div>
        <div className="mt-5 text-sm font-medium text-text-secondary">Status</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(statusMeta) as TableStatus[]).map((s) => <Chip key={s} active={t.status === s} onClick={() => setStatus(t.id, s)}>{statusMeta[s].label}</Chip>)}
        </div>
        <TSButton size="lg" className="mt-6 w-full" onClick={openOrder}>Open order</TSButton>
      </motion.div>
    </div>
  );
}
