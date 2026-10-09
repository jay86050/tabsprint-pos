import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Minus, Plus, Search, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { Chip, Money, Monogram, TSButton, VegDot } from "@/components/ts/primitives";
import type { MenuItem } from "@/data/menu";
import { useVenue } from "@/store/venue";
import { useKds } from "@/store/kds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/qr/$table")({
  head: ({ params }) => ({
    meta: [
      { title: `Order at table ${params.table} — TabSprint` },
      { name: "description", content: "Scan, order, open a tab and pay from your phone." },
      { property: "og:title", content: "Order from your table — TabSprint" },
      { property: "og:description", content: "Browse the menu, open a tab and pay from your phone." },
    ],
  }),
  component: Qr,
});

type CartLine = { key: string; item: MenuItem; qty: number; size: string; addons: string[]; price: number };
const sizes = [{ n: "Regular", d: 0 }, { n: "Large", d: 0.3 }];
const addons = [{ n: "Extra cheese", d: 0.12 }, { n: "Make it spicy", d: 0 }, { n: "Side salad", d: 0.2 }];

function Qr() {
  const { table } = Route.useParams();
  const venue = useVenue();
  const [cat, setCat] = useState(venue.categories[0]!);
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [tabName, setTabName] = useState<string | null>(null);
  const [placed, setPlaced] = useState<CartLine[]>([]);
  const [stage, setStage] = useState(-1);
  const [mod, setMod] = useState<MenuItem | null>(null);
  const [pay, setPay] = useState(false);
  const [feedback, setFeedback] = useState(false);

  useEffect(() => setCat(venue.categories[0]!), [venue.id]);
  useEffect(() => {
    if (stage < 0 || stage >= 2) return;
    const id = setTimeout(() => setStage(stage + 1), 6000);
    return () => clearTimeout(id);
  }, [stage]);

  const items = useMemo(
    () => venue.menu.filter((m) => (q ? m.name.toLowerCase().includes(q.toLowerCase()) : m.cat === cat) && (!vegOnly || m.veg)),
    [venue, cat, q, vegOnly],
  );
  const cartTotal = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const tabTotal = placed.reduce((a, l) => a + l.price * l.qty, 0);

  function send() {
    let name = tabName;
    if (!name) {
      name = prompt("Name for your tab")?.trim() || `Table ${table}`;
      setTabName(name);
    }
    useKds.getState().push(cart.map((l) => ({ id: l.key, item: l.item, qty: l.qty })), `${table} · ${name} (QR)`);
    setPlaced([...placed, ...cart]);
    setCart([]);
    setStage(0);
    toast.success("Added to your tab");
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-32">
      <header className="glass sticky top-0 z-30 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{venue.name}</h1>
            <p className="text-sm text-text-secondary">Table {table}{tabName ? ` · Tab: ${tabName}` : ""}</p>
          </div>
          <TSButton variant="secondary" onClick={() => toast.success("A server is on the way")}><Bell size={18} /> Call waiter</TSButton>
        </div>
        <label className="mt-3 flex h-11 items-center gap-2 rounded-sm border bg-raised px-3">
          <Search size={18} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <Chip active={vegOnly} onClick={() => setVegOnly(!vegOnly)}>Veg only</Chip>
          {venue.categories.map((c) => <Chip key={c} active={!q && cat === c} onClick={() => { setQ(""); setCat(c); }}>{c}</Chip>)}
        </div>
      </header>

      {stage >= 0 && <Tracker stage={stage} />}

      <div className="space-y-3 p-4">
        {items.map((m) => (
          <button key={m.id} disabled={m.out} onClick={() => setMod(m)} className="flex w-full gap-3 rounded-lg border bg-card p-3 text-left elev-1 disabled:opacity-50">
            <div className="w-28 shrink-0">{m.photo ? <img src={m.photo} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" /> : <Monogram name={m.name} hue={m.hue} />}</div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2"><VegDot veg={m.veg} /><span className="font-medium">{m.name}</span></div>
              <div className="mt-1 text-sm text-text-secondary">{m.out ? "Sold out tonight" : m.station === "Bar" ? "Freshly made at the bar" : "Made to order"}</div>
              <div className="mt-auto flex items-center justify-between"><Money value={m.price} className="font-semibold" /><span className="flex h-9 w-9 items-center justify-center rounded-md bg-volt text-ink-on-volt"><Plus size={18} /></span></div>
            </div>
          </button>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {cart.length > 0 ? (
          <TSButton size="lg" className="w-full" onClick={send}>{tabName ? "Add to tab" : "Open a tab & order"} · <Money value={cartTotal} /></TSButton>
        ) : placed.length > 0 ? (
          <TSButton size="lg" className="w-full" onClick={() => setPay(true)}>Pay tab · <Money value={tabTotal * (1 + venue.tax.rate)} /></TSButton>
        ) : (
          <p className="text-center text-sm text-text-secondary">Tap a dish to start your order.</p>
        )}
      </div>

      <AnimatePresence>
        {mod && <ModSheet item={mod} onClose={() => setMod(null)} onAdd={(l) => { setCart([...cart, l]); setMod(null); navigator.vibrate?.(10); }} />}
        {pay && <PaySheet total={tabTotal * (1 + venue.tax.rate)} onClose={() => setPay(false)} onPaid={() => { setPay(false); setPlaced([]); setStage(-1); setFeedback(true); }} />}
        {feedback && <Feedback onClose={() => setFeedback(false)} />}
      </AnimatePresence>
    </div>
  );
}

function Tracker({ stage }: { stage: number }) {
  const steps = ["Received", "Preparing", "Ready"];
  return (
    <div className="mx-4 mt-4 rounded-lg border bg-card p-4 elev-1">
      <div className="text-sm font-medium text-text-secondary">Your order</div>
      <div className="mt-3 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className={cn("h-1.5 w-full rounded-full transition-colors duration-200", i <= stage ? "bg-volt" : "bg-raised")} />
            <span className={cn("text-xs", i <= stage ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-background/70" onClick={onClose}>
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }} onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal className="w-full max-w-md rounded-t-xl border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] elev-3">
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModSheet({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (l: CartLine) => void }) {
  const [size, setSize] = useState(sizes[0]!);
  const [picked, setPicked] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const unit = Math.round(item.price * (1 + size.d + addons.filter((a) => picked.includes(a.n)).reduce((s, a) => s + a.d, 0)));
  return (
    <Sheet onClose={onClose}>
      <h2 className="text-2xl font-bold">{item.name}</h2>
      <div className="mt-5 text-sm font-medium text-text-secondary">Size</div>
      <div className="mt-2 flex gap-2">{sizes.map((s) => <Chip key={s.n} active={size.n === s.n} onClick={() => setSize(s)} className="h-12 flex-1 justify-center">{s.n}{s.d ? ` +${Math.round(item.price * s.d)}` : ""}</Chip>)}</div>
      <div className="mt-5 text-sm font-medium text-text-secondary">Add-ons</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {addons.map((a) => <Chip key={a.n} active={picked.includes(a.n)} onClick={() => setPicked(picked.includes(a.n) ? picked.filter((x) => x !== a.n) : [...picked, a.n])}>{a.n}{a.d ? ` +${Math.round(item.price * a.d)}` : ""}</Chip>)}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <TSButton variant="secondary" size="pos" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less"><Minus size={18} /></TSButton>
        <span className="font-mono text-xl tnum">{qty}</span>
        <TSButton variant="secondary" size="pos" onClick={() => setQty(qty + 1)} aria-label="More"><Plus size={18} /></TSButton>
        <TSButton size="lg" className="flex-1" onClick={() => onAdd({ key: crypto.randomUUID(), item, qty, size: size.n, addons: picked, price: unit })}>Add · <Money value={unit * qty} /></TSButton>
      </div>
    </Sheet>
  );
}

function PaySheet({ total, onClose, onPaid }: { total: number; onClose: () => void; onPaid: () => void }) {
  const [tip, setTip] = useState(10);
  const [split, setSplit] = useState(1);
  const [method, setMethod] = useState("UPI");
  const grand = total * (1 + tip / 100);
  return (
    <Sheet onClose={onClose}>
      <h2 className="text-2xl font-bold">Pay your tab</h2>
      <div className="mt-5 text-sm font-medium text-text-secondary">Add a tip</div>
      <div className="mt-2 flex gap-2">{[0, 10, 15, 20].map((p) => <Chip key={p} active={tip === p} onClick={() => setTip(p)} className="h-12 flex-1 justify-center">{p ? `${p}%` : "No tip"}</Chip>)}</div>
      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm font-medium text-text-secondary">Split with friends</span>
        <div className="ml-auto flex items-center gap-2">
          <TSButton variant="secondary" onClick={() => setSplit(Math.max(1, split - 1))} aria-label="Fewer"><Minus size={16} /></TSButton>
          <span className="w-5 text-center font-mono tnum">{split}</span>
          <TSButton variant="secondary" onClick={() => setSplit(split + 1)} aria-label="More"><Plus size={16} /></TSButton>
        </div>
      </div>
      {split > 1 && (
        <button onClick={() => { navigator.clipboard?.writeText(window.location.href + "?split=" + split); toast.success("Split link copied"); }} className="mt-3 flex w-full items-center justify-between rounded-md border bg-raised p-3 text-sm">
          <span>Each pays <Money value={Math.ceil(grand / split)} className="font-semibold" /></span><span className="flex items-center gap-1 text-volt-text"><Share2 size={16} /> Share link</span>
        </button>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2">{["UPI", "Card", "Wallet"].map((m) => <Chip key={m} active={method === m} onClick={() => setMethod(m)} className="h-12 justify-center">{m}</Chip>)}</div>
      <TSButton size="lg" className="mt-6 w-full" onClick={() => { navigator.vibrate?.([20, 40, 20]); onPaid(); }}>Pay <Money value={split > 1 ? Math.ceil(grand / split) : grand} /> with {method}</TSButton>
    </Sheet>
  );
}

function Feedback({ onClose }: { onClose: () => void }) {
  const [stars, setStars] = useState(0);
  return (
    <Sheet onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-volt text-ink-on-volt"><Check size={28} strokeWidth={3} /></span>
        <h2 className="mt-4 text-2xl font-bold">Paid. Thank you!</h2>
        <p className="mt-1 text-text-secondary">How was tonight?</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} aria-label={`${n} stars`} onClick={() => setStars(n)} className="p-1"><Star size={32} className={n <= stars ? "fill-warning text-warning" : "text-muted-foreground"} /></button>
          ))}
        </div>
        <textarea placeholder="Anything we should know? (optional)" className="mt-4 h-20 w-full rounded-sm border bg-raised p-3 outline-none" />
        <TSButton size="lg" className="mt-4 w-full" disabled={!stars} onClick={() => { toast.success("Thanks for the feedback"); onClose(); }}>Send feedback</TSButton>
      </div>
    </Sheet>
  );
}
