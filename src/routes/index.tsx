import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Beer, ChefHat, CreditCard, Gift, QrCode, ShieldAlert, Smartphone, Truck, Boxes, CalendarDays, Wifi, WifiOff, Check } from "lucide-react";
import { SiteNav } from "@/components/ts/SiteNav";
import { Chip, Money, TSButton, TSCard } from "@/components/ts/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabSprint — Run the rush. Not the register." },
      { name: "description", content: "The POS built for fast-paced bars, dine-ins and food trucks. One-tap tabs, instant splits, zero leakage." },
      { property: "og:title", content: "TabSprint — Run the rush. Not the register." },
      { property: "og:description", content: "One-tap tabs, instant splits, offline-ready POS for bars, dine-ins and food trucks." },
    ],
  }),
  component: Home,
});

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const } };

const industries = {
  Bars: ["One-tap tabs with card pre-auth", "Happy-hour auto pricing", "ID-check reminders on every tab"],
  "Dine-in": ["Live floor plan and table timers", "Courses: hold and fire", "Reservations and waitlist"],
  "Food trucks": ["Keeps selling offline", "One-hand mode and Daylight theme", "Auto queue numbers"],
} as const;

const bento = [
  { t: "Open tabs", i: Beer, span: "md:col-span-5 md:row-span-2" },
  { t: "Split and tip", i: CreditCard, span: "md:col-span-4" },
  { t: "Kitchen display", i: ChefHat, span: "md:col-span-3" },
  { t: "QR ordering", i: QrCode, span: "md:col-span-3" },
  { t: "Delivery hub", i: Truck, span: "md:col-span-4" },
  { t: "Inventory and recipe cost", i: Boxes, span: "md:col-span-4" },
  { t: "Leakage alerts", i: ShieldAlert, span: "md:col-span-4" },
  { t: "Reservations", i: CalendarDays, span: "md:col-span-3" },
  { t: "Loyalty and gift cards", i: Gift, span: "md:col-span-3" },
  { t: "Owner app", i: Smartphone, span: "md:col-span-2" },
];

function Home() {
  const [ind, setInd] = useState<keyof typeof industries>("Bars");
  const [offline, setOffline] = useState(false);
  return (
    <div className="min-h-dvh">
      <SiteNav />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="volt-glow-bg pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <motion.div {...reveal}>
            <Chip tone="ember" className="pointer-events-none h-8 text-xs">New · Leakage alerts</Chip>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-[64px]">Run the rush.<br /><span className="text-volt-text">Not the register.</span></h1>
            <p className="mt-6 max-w-xl text-lg text-text-secondary">TabSprint is the POS built for fast-paced bars, dine-ins, and food trucks. Open a tab in one tap, split in two, close the night with zero leakage.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pos"><TSButton size="lg">Start free trial</TSButton></Link>
              <Link to="/pos"><TSButton size="lg" variant="secondary">Watch 60-sec demo</TSButton></Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">No hardware lock-in · Works offline · GST/VAT ready</p>
          </motion.div>
          <div className="relative [perspective:1600px]">
            <div className="[transform:rotateY(-14deg)_rotateX(6deg)] rounded-xl border bg-panel p-3 elev-3">
              <DeviceMock industry={ind} />
            </div>
            {["Tab #14 · ₹2,480", "KOT sent", "Offline synced"].map((c, i) => (
              <motion.div key={c} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                className={["absolute -left-4 top-8", "absolute -right-2 top-1/2", "absolute bottom-6 left-10"][i] + " glass rounded-full border px-4 py-2 text-sm font-medium elev-2"}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-volt" />{c}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-7xl px-5 py-20">
        <motion.h2 {...reveal} className="text-4xl font-bold">Built for how you serve.</motion.h2>
        <div className="mt-8 flex gap-2" role="tablist">
          {(Object.keys(industries) as (keyof typeof industries)[]).map((k) => (
            <Chip key={k} role="tab" aria-selected={ind === k} active={ind === k} onClick={() => setInd(k)}>{k}</Chip>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {industries[ind].map((b) => (
            <TSCard key={b} className="flex items-start gap-3 p-6"><Check className="mt-0.5 text-volt-text" size={20} />{b}</TSCard>
          ))}
        </div>
      </section>

      {/* Bento */}
      <section id="product" className="mx-auto max-w-7xl px-5 py-20">
        <motion.h2 {...reveal} className="text-4xl font-bold">Everything the shift needs.</motion.h2>
        <div className="mt-10 grid auto-rows-[160px] gap-4 md:grid-cols-12">
          {bento.map(({ t, i: Icon, span }, idx) => (
            <motion.div key={t} {...reveal} transition={{ ...reveal.transition, delay: idx * 0.04 }} className={span}>
              <TSCard className="group flex h-full flex-col justify-between p-6 transition-colors hover:border-volt/40">
                <Icon size={24} strokeWidth={1.75} className="text-volt-text transition-transform group-hover:scale-110" />
                <div className="font-display text-lg font-semibold">{t}</div>
              </TSCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Leakage */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2">
        <motion.div {...reveal}>
          <h2 className="text-4xl font-bold">Stop the quiet losses.</h2>
          <p className="mt-4 text-lg text-text-secondary">Leakage Alerts flag voids after payment, oversized discounts, comps and cash mismatches by staff, the moment they happen.</p>
        </motion.div>
        <TSCard raised className="divide-y">
          {[["Arjun", "Void after payment", 1240, "danger"], ["Meera", "Discount 35%", 860, "warning"], ["Kabir", "Cash short at close", 500, "danger"], ["Sana", "3 no-sale drawer opens", 0, "warning"]].map(([n, e, a, t]) => (
            <div key={n as string} className="flex items-center gap-4 p-4">
              <span className={`h-2.5 w-2.5 rounded-full ${t === "danger" ? "bg-danger" : "bg-warning"}`} />
              <div className="flex-1"><div className="font-medium">{e}</div><div className="text-sm text-muted-foreground">{n} · 10:42 pm</div></div>
              {(a as number) > 0 && <Money value={a as number} className="font-semibold" />}
            </div>
          ))}
        </TSCard>
      </section>

      {/* Offline */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <motion.div {...reveal}>
          <button onClick={() => setOffline(!offline)} aria-label="Toggle network demo" className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border elev-2 transition-colors ${offline ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
            {offline ? <WifiOff size={32} /> : <Wifi size={32} />}
          </button>
          <h2 className="mt-6 text-4xl font-bold">Keep selling when the Wi-Fi dies.</h2>
          <p className="mt-3 text-text-secondary">{offline ? "Offline · 3 orders queued. Orders save on the device." : "Online · everything synced. Tap the icon to try it."}</p>
        </motion.div>
      </section>

      {/* Pricing teaser + FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center text-4xl font-bold">Questions, answered.</h2>
        <Accordion type="single" collapsible className="mt-8">
          {[["Do I need special hardware?", "No. Any tablet, phone or laptop with a browser works. Bring your own printer."],
            ["What happens when the internet drops?", "You keep selling. Orders are saved on the device and sync when you're back."],
            ["Does it handle GST and VAT?", "Yes. GST slabs with CGST/SGST split, VAT, service charge, inclusive or exclusive."],
            ["Can I try it free?", "Yes. 14 days, no card needed."]].map(([q, a]) => (
            <AccordionItem key={q} value={q}><AccordionTrigger className="text-base">{q}</AccordionTrigger><AccordionContent className="text-text-secondary">{a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <TSCard raised className="relative overflow-hidden p-12 text-center">
          <div className="volt-glow-bg absolute inset-0" />
          <h2 className="relative text-4xl font-bold">Your next rush starts here.</h2>
          <div className="relative mt-6 flex justify-center gap-3">
            <Link to="/pos"><TSButton size="lg">Start free trial</TSButton></Link>
            <Link to="/pricing"><TSButton size="lg" variant="secondary">See pricing</TSButton></Link>
          </div>
        </TSCard>
      </section>
      <footer className="border-t py-10 text-center text-sm text-muted-foreground">© 2026 TabSprint · <Link to="/styleguide" className="hover:text-foreground">Styleguide</Link></footer>
    </div>
  );
}

function DeviceMock({ industry }: { industry: string }) {
  const items = industry === "Food trucks" ? ["Vada Pav", "Masala Chai", "Cheese Maggi", "Cold Coffee"] : industry === "Dine-in" ? ["Butter Chicken", "Garlic Naan", "Dal Makhani", "Lassi"] : ["Margarita", "Negroni", "IPA Tap", "Fries"];
  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-3 rounded-lg bg-background p-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((n, i) => (
          <div key={n} className="rounded-md border bg-card p-3">
            <div className="aspect-[4/3] rounded-md" style={{ background: `oklch(0.32 0.06 ${40 + i * 40})` }} />
            <div className="mt-2 text-xs font-medium">{n}</div>
            <div className="font-mono text-xs text-text-secondary tnum">₹{320 + i * 90}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col rounded-md border bg-panel p-3 text-xs">
        <div className="font-semibold">Tab #14</div>
        <div className="mt-2 flex-1 space-y-1 text-text-secondary">{items.slice(0, 3).map((n) => <div key={n}>1× {n}</div>)}</div>
        <div className="mt-3 font-mono text-lg font-semibold text-volt-text tnum">₹2,480</div>
        <div className="btn-volt mt-2 rounded-md py-2 text-center font-semibold">Charge</div>
      </div>
    </div>
  );
}
