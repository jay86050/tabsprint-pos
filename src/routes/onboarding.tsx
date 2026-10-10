import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Beer, Check, Trash2, Truck, Upload, UtensilsCrossed, Plus } from "lucide-react";
import { toast } from "sonner";
import { Logo, TSButton, TSCard } from "@/components/ts/primitives";
import { useVenueStore, type StaffInvite } from "@/store/venue";
import { parseMenuCsv, seedMenu, useMenuStore } from "@/store/menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your venue — TabSprint" },
      { name: "description", content: "Four quick steps: business type, tax, menu and staff." },
      { property: "og:title", content: "Set up your venue — TabSprint" },
      { property: "og:description", content: "Get TabSprint ready for your first rush in minutes." },
    ],
  }),
  component: Onboarding,
});

type Type = "Bar" | "Dine-in" | "Food truck";
const types: { t: Type; icon: typeof Beer; venue: string; blurb: string; staff: StaffInvite[] }[] = [
  { t: "Bar", icon: Beer, venue: "mumbai", blurb: "Tabs, ID checks, happy hour", staff: [{ name: "", role: "Bartender" }, { name: "", role: "Server" }] },
  { t: "Dine-in", icon: UtensilsCrossed, venue: "dubai", blurb: "Tables, courses, service charge", staff: [{ name: "", role: "Server" }, { name: "", role: "Kitchen" }] },
  { t: "Food truck", icon: Truck, venue: "pune", blurb: "Counter speed, tax-inclusive prices", staff: [{ name: "", role: "Cashier" }] },
];
const countries = [
  { c: "India", currency: "INR" as const, symbol: "₹", label: "GST", rate: 0.05, split: true, service: 0 },
  { c: "UAE", currency: "AED" as const, symbol: "AED", label: "VAT", rate: 0.05, split: false, service: 0.1 },
];
const ROLES = ["Owner", "Manager", "Cashier", "Bartender", "Server", "Kitchen"];
const steps = ["Business", "Tax", "Menu", "Staff"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<Type>("Bar");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("India");
  const [rate, setRate] = useState(5);
  const [inclusive, setInclusive] = useState(false);
  const [service, setService] = useState(0);
  const [menuSrc, setMenuSrc] = useState<"sample" | "csv">("sample");
  const [csv, setCsv] = useState<ReturnType<typeof parseMenuCsv> | null>(null);
  const [staff, setStaff] = useState<StaffInvite[]>(types[0]!.staff);

  const pickType = (t: Type) => {
    setType(t);
    const d = types.find((x) => x.t === t)!;
    setStaff(d.staff);
    const c = t === "Dine-in" ? countries[1]! : countries[0]!;
    setCountry(c.c); setRate(c.rate * 100); setService(c.service * 100); setInclusive(t === "Food truck");
  };
  const pickCountry = (c: string) => {
    const x = countries.find((k) => k.c === c)!;
    setCountry(c); setRate(x.rate * 100); setService(x.service * 100);
  };

  const onFile = async (f: File) => {
    const r = parseMenuCsv(await f.text());
    if (!r.items.length) return toast.error("No items found. Use: name, price, category, veg, station");
    setCsv(r); setMenuSrc("csv"); toast.success(`${r.items.length} items imported`);
  };

  const finish = () => {
    const d = types.find((x) => x.t === type)!;
    const c = countries.find((k) => k.c === country)!;
    const base = seedMenu(d.venue);
    useMenuStore.getState().setMenu(d.venue, menuSrc === "csv" && csv ? { ...base, ...csv } : base);
    useVenueStore.getState().completeOnboarding(d.venue, {
      ...(name.trim() ? { name: name.trim() } : {}),
      currency: c.currency, symbol: c.symbol,
      tax: { label: c.label, rate: rate / 100, split: c.split, serviceCharge: service / 100, inclusive },
    }, staff.filter((s) => s.name.trim()));
    toast.success("You're ready for service");
    nav({ to: "/pos" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-panel px-4"><Logo /><span className="text-sm text-muted-foreground">Step {step + 1} of 4</span></header>
      <div className="h-1.5 bg-raised"><div className="h-full bg-volt transition-[width] duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <ol className="mb-8 flex gap-2 text-sm">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2", i <= step ? "text-foreground" : "text-muted-foreground")}>
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-xs", i < step && "border-volt bg-volt text-ink-on-volt", i === step && "border-volt")}>{i < step ? <Check size={14} /> : i + 1}</span>{s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section>
            <h1 className="font-display text-3xl font-semibold">What do you run?</h1>
            <p className="mt-2 text-text-secondary">We'll set taxes, layout and roles to match.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {types.map(({ t, icon: Icon, blurb }) => (
                <button key={t} onClick={() => pickType(t)} className={cn("rounded-lg border bg-card p-5 text-left elev-1 transition-colors", type === t && "border-volt bg-volt/10")}>
                  <Icon size={28} strokeWidth={1.75} className={type === t ? "text-volt" : "text-text-secondary"} />
                  <div className="mt-3 font-semibold">{t}</div><div className="mt-1 text-sm text-muted-foreground">{blurb}</div>
                </button>
              ))}
            </div>
            <label className="mt-6 block text-sm font-medium">Venue name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Volt Room" className="mt-2 h-12 w-full rounded-md border bg-raised px-3 outline-none focus:border-volt" />
            </label>
          </section>
        )}

        {step === 1 && (
          <section>
            <h1 className="font-display text-3xl font-semibold">Country and tax</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {countries.map((c) => (
                <button key={c.c} onClick={() => pickCountry(c.c)} className={cn("rounded-lg border bg-card p-4 text-left", country === c.c && "border-volt bg-volt/10")}>
                  <div className="font-semibold">{c.c}</div><div className="text-sm text-muted-foreground">{c.currency} · {c.label}{c.split ? " (CGST + SGST)" : ""}</div>
                </button>
              ))}
            </div>
            <TSCard className="mt-6 grid gap-4 p-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Tax rate (%)<input type="number" min={0} max={40} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 h-11 w-full rounded-md border bg-raised px-3 font-mono" /></label>
              <label className="text-sm font-medium">Service charge (%)<input type="number" min={0} max={25} value={service} onChange={(e) => setService(Number(e.target.value))} className="mt-2 h-11 w-full rounded-md border bg-raised px-3 font-mono" /></label>
              <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} className="h-5 w-5 accent-[var(--volt)]" />Menu prices include tax</label>
            </TSCard>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="font-display text-3xl font-semibold">Add your menu</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={() => setMenuSrc("sample")} className={cn("rounded-lg border bg-card p-5 text-left", menuSrc === "sample" && "border-volt bg-volt/10")}>
                <div className="font-semibold">Load sample menu</div><div className="mt-1 text-sm text-muted-foreground">{seedMenu(types.find((x) => x.t === type)!.venue).items.length} {type.toLowerCase()} items, ready to edit</div>
              </button>
              <label className={cn("cursor-pointer rounded-lg border bg-card p-5", menuSrc === "csv" && "border-volt bg-volt/10")}>
                <div className="flex items-center gap-2 font-semibold"><Upload size={18} /> Import CSV</div>
                <div className="mt-1 text-sm text-muted-foreground">{csv ? `${csv.items.length} items in ${csv.categories.length} categories` : "name, price, category, veg, station"}</div>
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </label>
            </div>
            {menuSrc === "csv" && csv && (
              <TSCard className="mt-4 max-h-60 divide-y overflow-auto">
                {csv.items.slice(0, 20).map((i) => <div key={i.id} className="flex justify-between px-4 py-2 text-sm"><span>{i.name} <span className="text-muted-foreground">· {i.cat}</span></span><span className="font-mono tnum">{i.price}</span></div>)}
              </TSCard>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="font-display text-3xl font-semibold">Invite your team</h1>
            <p className="mt-2 text-text-secondary">They'll get a 4-digit PIN to clock in. You can skip this.</p>
            <div className="mt-6 space-y-2">
              {staff.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.name} placeholder="Name" onChange={(e) => setStaff(staff.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="h-12 flex-1 rounded-md border bg-raised px-3 outline-none focus:border-volt" />
                  <select value={s.role} onChange={(e) => setStaff(staff.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} className="h-12 rounded-md border bg-raised px-3">
                    {ROLES.map((r) => <option key={r} className="bg-card">{r}</option>)}
                  </select>
                  <TSButton variant="ghost" aria-label="Remove" className="h-12" onClick={() => setStaff(staff.filter((_, j) => j !== i))}><Trash2 size={18} /></TSButton>
                </div>
              ))}
              <TSButton variant="secondary" onClick={() => setStaff([...staff, { name: "", role: "Server" }])}><Plus size={18} /> Add person</TSButton>
            </div>
          </section>
        )}

        <div className="mt-10 flex justify-between">
          <TSButton variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</TSButton>
          {step < 3 ? <TSButton size="lg" onClick={() => setStep(step + 1)}>Continue</TSButton> : <TSButton size="lg" onClick={finish}>Open the POS</TSButton>}
        </div>
      </main>
    </div>
  );
}
