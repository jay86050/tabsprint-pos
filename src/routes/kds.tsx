import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, BellOff, RotateCcw, Zap } from "lucide-react";
import { AppNav } from "@/components/ts/AppNav";
import { Chip, TSButton } from "@/components/ts/primitives";
import { ageColor, useKds, type Station, type Ticket, type TicketStatus } from "@/store/kds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kds")({
  head: () => ({
    meta: [
      { title: "Kitchen display — TabSprint" },
      { name: "description", content: "Kitchen and bar tickets by station with live timers and bump." },
      { property: "og:title", content: "Kitchen display — TabSprint" },
      { property: "og:description", content: "New, preparing and ready tickets readable from across the kitchen." },
    ],
  }),
  component: Kds,
});

const cols: { key: TicketStatus; label: string; action: string }[] = [
  { key: "new", label: "New", action: "Start" },
  { key: "preparing", label: "Preparing", action: "Ready" },
  { key: "ready", label: "Ready", action: "Served" },
];

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.25);
  } catch {}
}

function Kds() {
  const { tickets, bumped, bump, recall, simulate } = useKds();
  const [station, setStation] = useState<Station | "All">("All");
  const [sound, setSound] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const count = useRef(tickets.length);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    if (tickets.length > count.current && sound) beep();
    count.current = tickets.length;
  }, [tickets.length, sound]);

  const shown = tickets.filter((t) => station === "All" || t.station === station);
  return (
    <div className="flex h-dvh flex-col">
      <AppNav />
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        {(["All", "Kitchen", "Bar", "Grill"] as const).map((s) => (
          <Chip key={s} active={station === s} onClick={() => setStation(s)} className="h-12 text-base">
            {s} <span className="font-mono tnum opacity-70">{s === "All" ? tickets.length : tickets.filter((t) => t.station === s).length}</span>
          </Chip>
        ))}
        <div className="ml-auto flex gap-2">
          <TSButton variant="secondary" onClick={() => setSound(!sound)} aria-label="Toggle sound">{sound ? <Bell size={18} /> : <BellOff size={18} />}</TSButton>
          <TSButton variant="secondary" disabled={!bumped.length} onClick={recall}><RotateCcw size={18} /> Recall</TSButton>
          <TSButton onClick={simulate}><Zap size={18} /> New ticket</TSButton>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-3">
        {cols.map((c) => {
          const list = shown.filter((t) => t.status === c.key).sort((a, b) => a.createdAt - b.createdAt);
          return (
            <section key={c.key} className="flex min-h-0 flex-col rounded-lg bg-panel p-3">
              <h2 className="mb-3 flex items-center justify-between px-1 text-xl font-semibold">{c.label}<span className="font-mono text-base text-text-secondary tnum">{list.length}</span></h2>
              <div className="flex-1 space-y-3 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {list.map((t, i) => <TicketCard key={t.id} t={t} i={i} now={now} action={c.action} onBump={() => { navigator.vibrate?.(15); bump(t.id); }} />)}
                </AnimatePresence>
                {list.length === 0 && <p className="py-10 text-center text-text-secondary">All clear.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TicketCard({ t, i, now, action, onBump }: { t: Ticket; i: number; now: number; action: string; onBump: () => void }) {
  const secs = Math.floor((now - t.createdAt) / 1000);
  const mins = Math.floor(secs / 60);
  const tone = ageColor(mins);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.2, delay: i * 0.04 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={(_, info) => info.offset.x > 100 && onBump()}
      className={cn("rounded-lg border-2 bg-card p-4 elev-2", tone === "danger" ? "border-danger" : tone === "warning" ? "border-warning" : "border-border")}
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">{t.label}</div>
          <div className="text-sm text-text-secondary">{t.station}{t.course ? ` · Course ${t.course}` : ""}</div>
        </div>
        <span className={cn("rounded-md px-3 py-1 font-mono text-xl font-semibold tnum", tone === "danger" ? "bg-danger/15 text-danger" : tone === "warning" ? "bg-warning/15 text-warning" : "bg-raised")}>
          {mins}:{String(secs % 60).padStart(2, "0")}
        </span>
      </header>
      <ul className="mt-3 space-y-2">
        {t.items.map((it, k) => (
          <li key={k} className="text-lg">
            <span className="font-mono font-semibold tnum">{it.qty}×</span> {it.name}
            {it.note && <div className="text-base text-ember">{it.note}</div>}
            {it.allergy && <div className="flex items-center gap-1 text-base font-bold uppercase text-danger"><AlertTriangle size={18} /> Allergy: {it.allergy}</div>}
          </li>
        ))}
      </ul>
      <TSButton size="lg" variant={action === "Served" ? "primary" : "secondary"} className="mt-4 w-full" onClick={onBump}>{action} →</TSButton>
    </motion.article>
  );
}
