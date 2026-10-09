import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { categories, menu } from "@/data/menu";
import { totals, usePos } from "@/store/pos";
import { Chip, Logo, Money, Monogram, TSButton, VegDot } from "@/components/ts/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS — TabSprint" },
      { name: "description", content: "Fast order entry with bar tabs, GST and checkout." },
      { property: "og:title", content: "POS — TabSprint" },
      { property: "og:description", content: "Try the TabSprint order screen with demo bar tabs." },
    ],
  }),
  component: Pos,
});

const vibrate = (ms: number | number[]) => typeof navigator !== "undefined" && navigator.vibrate?.(ms);

function Pos() {
  const s = usePos();
  const [cat, setCat] = useState(categories[0]);
  const [q, setQ] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const searchRef = useRef<HTMLInputElement>(null);
  const tab = s.tabs.find((t) => t.id === s.activeTab)!;
  const t = totals(tab.lines);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30e3);
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === "n") newTab();
    };
    window.addEventListener("keydown", key);
    return () => { clearInterval(id); window.removeEventListener("keydown", key); };
  }, []);

  const items = useMemo(() => {
    if (!q) return menu.filter((m) => m.cat === cat);
    const n = q.toLowerCase();
    return menu.filter((m) => m.name.toLowerCase().split("").reduce((i, c) => (i < n.length && c === n[i] ? i + 1 : i), 0) === n.length);
  }, [cat, q]);

  function newTab() {
    const name = prompt("Tab name")?.trim();
    if (name) usePos.getState().openTab(name);
  }

  function removeLine(id: string) {
    const line = s.remove(id);
    if (line) toast(`${line.item.name} removed`, { duration: 5000, action: { label: "Undo", onClick: () => usePos.getState().restore(line) } });
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-panel px-4">
        <Link to="/" aria-label="Home"><Logo className="text-base" /></Link>
        <div className="flex flex-1 gap-2 overflow-x-auto px-2">
          {s.tabs.map((tb) => {
            const tt = totals(tb.lines).total;
            return (
              <motion.button key={tb.id + tb.lines.length} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 0.2 }}
                onClick={() => s.setActive(tb.id)}
                className={cn("flex h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm", tb.id === s.activeTab ? "border-volt bg-volt text-ink-on-volt" : "bg-raised")}>
                <span className="font-medium">{tb.name}</span>
                <span className="font-mono tnum opacity-80">₹{tt.toFixed(0)}</span>
                <span className="text-xs opacity-60">{Math.round((now - tb.openedAt) / 60e3)}m</span>
              </motion.button>
            );
          })}
          <TSButton variant="secondary" className="h-11 shrink-0" onClick={newTab}><Plus size={18} /> Tab</TSButton>
        </div>
        <button onClick={() => { const n = s.toggleOnline(); vibrate(20); if (n) toast.success(`${n} orders synced`); }}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full border bg-raised px-3 text-sm">
          <span className={cn("h-2.5 w-2.5 rounded-full", s.online ? "bg-success" : "bg-warning")} />
          {s.online ? "Online" : `Offline, ${s.queued} queued`}
        </button>
      </header>

      <div className="flex shrink-0 items-center justify-between bg-ember/15 px-4 py-2 text-sm text-ember">
        <span className="font-semibold">Happy hour live</span><span className="font-mono tnum">ends in 42:10</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Items 62% */}
        <section className="flex min-h-0 flex-col md:w-[62%]">
          <div className="space-y-3 p-4">
            <label className="flex h-12 items-center gap-2 rounded-sm border bg-raised px-3">
              <Search size={20} className="text-muted-foreground" />
              <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu  ( / )" className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
              {q && <button aria-label="Clear" onClick={() => setQ("")}><X size={18} /></button>}
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((c) => <Chip key={c} active={!q && c === cat} onClick={() => { setQ(""); setCat(c); }} className="h-12 text-base">{c}</Chip>)}
            </div>
          </div>
          <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto px-4 pb-4 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((m) => (
              <button key={m.id} disabled={m.out} onClick={() => { s.add(m); vibrate(10); }}
                className="group relative rounded-lg border bg-card p-2 text-left elev-1 transition-transform duration-[120ms] active:scale-[0.97] disabled:opacity-50">
                {m.photo ? <img src={m.photo} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" /> : <Monogram name={m.name} hue={m.hue} />}
                {m.out && <span className="absolute inset-2 flex items-center justify-center rounded-md bg-background/70 font-display text-xl font-bold">86'd</span>}
                {m.stock && <span className="absolute right-3 top-3 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-ink-on-volt">{m.stock} left</span>}
                <div className="mt-2 flex items-center gap-2 px-1"><VegDot veg={m.veg} /><span className="truncate text-base font-medium">{m.name}</span></div>
                <div className="px-1 text-right text-base text-text-secondary"><Money value={m.price} /></div>
              </button>
            ))}
          </div>
        </section>

        {/* Cart 38% */}
        <aside className="flex max-h-[45dvh] min-h-0 flex-col border-t bg-panel md:max-h-none md:w-[38%] md:border-l md:border-t-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">{tab.name}</h2>
            {tab.idCheck && <Chip tone="warning" className="pointer-events-none h-8 text-xs">Check ID</Chip>}
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {tab.lines.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Tap an item to start the round.</div>
            ) : (
              <AnimatePresence initial={false}>
                {tab.lines.map((l) => (
                  <motion.div key={l.id} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 border-b py-3">
                    <div className="flex-1"><div className="font-medium">{l.item.name}</div><div className="text-sm text-muted-foreground"><Money value={l.item.price} /> each</div></div>
                    <button aria-label="Less" onClick={() => s.dec(l.id)} className="btn-ink flex h-12 w-12 items-center justify-center rounded-md"><Minus size={18} /></button>
                    <span className="w-6 text-center font-mono tnum">{l.qty}</span>
                    <button aria-label="More" onClick={() => s.add(l.item)} className="btn-ink flex h-12 w-12 items-center justify-center rounded-md"><Plus size={18} /></button>
                    <button aria-label="Remove" onClick={() => removeLine(l.id)} className="flex h-12 w-12 items-center justify-center rounded-md text-danger hover:bg-danger/10"><Trash2 size={18} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          <div className="space-y-1 border-t p-4 text-sm">
            <Row k="Subtotal" v={t.subtotal} /><Row k="CGST 2.5%" v={t.cgst} /><Row k="SGST 2.5%" v={t.sgst} />
            <div className="flex items-baseline justify-between pt-2"><span className="text-base font-semibold">Total</span><Money value={t.total} className="text-[28px] font-semibold text-volt-text" /></div>
            <TSButton size="lg" className="mt-3 w-full" disabled={!tab.lines.length} onClick={() => setCheckout(true)}>Charge ₹{t.total.toFixed(0)}</TSButton>
          </div>
        </aside>
      </div>
      {checkout && <Checkout total={t.total} onClose={() => setCheckout(false)} onDone={() => { s.closeActive(); setCheckout(false); }} />}
    </div>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return <div className="flex justify-between text-text-secondary"><span>{k}</span><Money value={v} /></div>;
}

function Checkout({ total, onClose, onDone }: { total: number; onClose: () => void; onDone: () => void }) {
  const [tipPct, setTipPct] = useState(0);
  const [split, setSplit] = useState(1);
  const [method, setMethod] = useState("Cash");
  const [paid, setPaid] = useState(false);
  const grand = total * (1 + tipPct / 100);
  if (paid)
    return (
      <Overlay onClose={onDone}>
        <div className="py-8 text-center">
          <motion.svg viewBox="0 0 52 52" className="mx-auto h-24 w-24" initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.04, 1] }} transition={{ duration: 0.32 }}>
            <circle cx="26" cy="26" r="24" className="fill-volt/15 stroke-volt" strokeWidth="2" />
            <motion.path d="M15 27l7 7 15-16" fill="none" className="stroke-volt" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
          </motion.svg>
          <h2 className="mt-4 text-2xl font-bold">Paid <Money value={grand} /></h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">{["WhatsApp", "SMS", "Email", "Print"].map((r) => <Chip key={r} onClick={() => toast.success(`Receipt sent via ${r}`)}>{r}</Chip>)}</div>
          <TSButton size="lg" className="mt-8 w-full" autoFocus onClick={onDone}>New order</TSButton>
        </div>
      </Overlay>
    );
  return (
    <Overlay onClose={onClose}>
      <h2 className="text-2xl font-bold">Checkout</h2>
      <div className="mt-6 text-sm font-medium text-text-secondary">Tip</div>
      <div className="mt-2 flex gap-2">{[0, 10, 15, 20].map((p) => <Chip key={p} active={tipPct === p} onClick={() => setTipPct(p)} className="h-12 flex-1 justify-center">{p ? `${p}%` : "No tip"}</Chip>)}</div>
      <div className="mt-5 text-sm font-medium text-text-secondary">Split equally</div>
      <div className="mt-2 flex items-center gap-3">
        <TSButton variant="secondary" size="pos" onClick={() => setSplit(Math.max(1, split - 1))}><Minus size={18} /></TSButton>
        <span className="font-mono text-xl tnum">{split}</span>
        <TSButton variant="secondary" size="pos" onClick={() => setSplit(split + 1)}><Plus size={18} /></TSButton>
        {split > 1 && <span className="ml-auto text-text-secondary"><Money value={Math.ceil(grand / split)} /> each</span>}
      </div>
      <div className="mt-5 text-sm font-medium text-text-secondary">Pay with</div>
      <div className="mt-2 grid grid-cols-3 gap-2">{["Cash", "UPI", "Card", "Wallet", "Gift card", "Points"].map((m) => <Chip key={m} active={method === m} onClick={() => setMethod(m)} className="h-12 justify-center">{m}</Chip>)}</div>
      <div className="mt-6 flex items-baseline justify-between"><span>Total</span><Money value={grand} className="text-[28px] font-semibold text-volt-text" /></div>
      <TSButton size="lg" className="mt-4 w-full" onClick={() => { navigator.vibrate?.([20, 40, 20]); setPaid(true); }}>Take {method} payment</TSButton>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 md:items-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal
        className="w-full max-w-md rounded-t-xl border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] elev-3 md:rounded-xl">
        {children}
      </motion.div>
    </div>
  );
}
