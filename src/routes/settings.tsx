import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AppNav } from "@/components/ts/AppNav";
import { Chip, TSCard } from "@/components/ts/primitives";
import { Switch } from "@/components/ui/switch";
import { useVenue } from "@/store/venue";
import { usePos } from "@/store/pos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TabSprint" },
      { name: "description", content: "Roles and permissions, audit log, GST/VAT and device preferences." },
      { property: "og:title", content: "Settings — TabSprint" },
      { property: "og:description", content: "Control who can do what, and see every change." },
    ],
  }),
  component: Settings,
});

const roles = ["Owner", "Manager", "Cashier", "Bartender", "Server", "Kitchen"] as const;
const perms = ["Take orders", "Open and close tabs", "Apply discounts", "Void items", "Comp items", "Open cash drawer", "Refunds", "View reports", "Edit menu", "Manage staff"];
const defaults: Record<string, number> = { Owner: 10, Manager: 9, Cashier: 3, Bartender: 3, Server: 2, Kitchen: 0 };

const audit = [
  { t: "11:02 pm", who: "Arjun", role: "Bartender", action: "Void", detail: "Voided 2× Negroni on #1042 after payment" },
  { t: "10:48 pm", who: "Rohan", role: "Manager", action: "Discount", detail: "Approved 20% on Table 6" },
  { t: "10:40 pm", who: "Sana", role: "Server", action: "Drawer", detail: "No-sale drawer open" },
  { t: "9:40 pm", who: "Meera", role: "Server", action: "Discount", detail: "35% discount on #1031 — 'regular'" },
  { t: "9:15 pm", who: "Rohan", role: "Manager", action: "Menu", detail: "Marked Mango Mule as 86'd" },
  { t: "8:05 pm", who: "Kabir", role: "Cashier", action: "Cash", detail: "Shift close short by 500" },
  { t: "7:30 pm", who: "Arjun", role: "Bartender", action: "Comp", detail: "Comped Negroni without approval" },
  { t: "6:00 pm", who: "Rohan", role: "Manager", action: "Login", detail: "Opened the day" },
];

function Settings() {
  const [tab, setTab] = useState<"Roles" | "Audit log" | "Taxes" | "Device">("Roles");
  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <h1 className="text-[28px] font-bold">Settings</h1>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {(["Roles", "Audit log", "Taxes", "Device"] as const).map((t) => <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>)}
        </div>
        <div className="mt-6">{tab === "Roles" ? <RoleMatrix /> : tab === "Audit log" ? <Audit /> : tab === "Taxes" ? <Taxes /> : <Device />}</div>
      </main>
    </div>
  );
}

function RoleMatrix() {
  const [m, setM] = useState<Record<string, Set<string>>>(() => Object.fromEntries(roles.map((r) => [r, new Set(perms.slice(0, defaults[r]))])));
  const toggle = (r: string, p: string) => {
    if (r === "Owner") return;
    setM((s) => { const n = new Set(s[r]); n.has(p) ? n.delete(p) : n.add(p); return { ...s, [r]: n }; });
  };
  return (
    <TSCard className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead><tr className="border-b"><th className="p-4 text-left font-medium text-text-secondary">Permission</th>{roles.map((r) => <th key={r} className="p-4 font-semibold">{r}</th>)}</tr></thead>
        <tbody>
          {perms.map((p) => (
            <tr key={p} className="border-b last:border-0">
              <td className="p-4">{p}</td>
              {roles.map((r) => {
                const on = m[r]!.has(p);
                return (
                  <td key={r} className="p-2 text-center">
                    <button aria-label={`${r}: ${p}`} aria-pressed={on} disabled={r === "Owner"} onClick={() => toggle(r, p)}
                      className={cn("inline-flex h-11 w-11 items-center justify-center rounded-md border transition-colors", on ? "border-volt bg-volt text-ink-on-volt" : "bg-raised text-transparent hover:text-muted-foreground", r === "Owner" && "opacity-70")}>
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </TSCard>
  );
}

function Audit() {
  const [who, setWho] = useState("All");
  const [action, setAction] = useState("All");
  const people = ["All", ...new Set(audit.map((a) => a.who))];
  const actions = ["All", ...new Set(audit.map((a) => a.action))];
  const rows = audit.filter((a) => (who === "All" || a.who === who) && (action === "All" || a.action === action));
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Filter by staff" className="h-11 rounded-sm border bg-raised px-3">{people.map((p) => <option key={p}>{p}</option>)}</select>
        <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter by action" className="h-11 rounded-sm border bg-raised px-3">{actions.map((p) => <option key={p}>{p}</option>)}</select>
      </div>
      <TSCard className="mt-4 divide-y">
        {rows.map((a, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 p-4">
            <span className="w-20 font-mono text-sm text-muted-foreground tnum">{a.t}</span>
            <span className="rounded-md bg-raised px-2 py-0.5 text-xs font-semibold">{a.action}</span>
            <span className="flex-1">{a.detail}</span>
            <span className="text-sm text-text-secondary">{a.who} · {a.role}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="p-8 text-center text-text-secondary">No entries match these filters.</p>}
      </TSCard>
    </>
  );
}

function Taxes() {
  const v = useVenue();
  const [inclusive, setInclusive] = useState(v.tax.inclusive);
  const [svc, setSvc] = useState(v.tax.serviceCharge > 0);
  const slabs = v.tax.label === "GST" ? [["Restaurant service", "5%"], ["Hotel restaurant (room > ₹7,500)", "18%"], ["Packaged drinks", "18%"], ["Alcohol", "State VAT"]] : [["Food and beverage", "5% VAT"], ["Tourism fee", "7%"], ["Municipality fee", "7%"]];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TSCard className="p-5">
        <h2 className="font-semibold">{v.tax.label} for {v.name}</h2>
        <p className="mt-1 text-sm text-text-secondary">{v.city} · {v.currency}{v.tax.split ? " · split into CGST + SGST" : ""}</p>
        <ul className="mt-4 divide-y">{slabs.map(([k, r]) => <li key={k} className="flex justify-between py-3"><span>{k}</span><span className="font-mono tnum">{r}</span></li>)}</ul>
      </TSCard>
      <TSCard className="space-y-5 p-5">
        <label className="flex items-center justify-between gap-4"><span><span className="block font-medium">Prices include tax</span><span className="text-sm text-text-secondary">Menu prices already contain {v.tax.label}</span></span><Switch checked={inclusive} onCheckedChange={setInclusive} /></label>
        <label className="flex items-center justify-between gap-4"><span><span className="block font-medium">Service charge 10%</span><span className="text-sm text-text-secondary">Added before tax on dine-in bills</span></span><Switch checked={svc} onCheckedChange={setSvc} /></label>
      </TSCard>
    </div>
  );
}

function Device() {
  const [perf, setPerf] = useState(false);
  const [light, setLight] = useState(false);
  const online = usePos((s) => s.online);
  const toggleOnline = usePos((s) => s.toggleOnline);
  useEffect(() => { document.documentElement.classList.toggle("perf", perf); }, [perf]);
  useEffect(() => { document.documentElement.classList.toggle("light", light); document.documentElement.classList.toggle("dark", !light); }, [light]);
  return (
    <TSCard className="max-w-xl space-y-5 p-5">
      <label className="flex items-center justify-between gap-4"><span><span className="block font-medium">Daylight theme</span><span className="text-sm text-text-secondary">High-contrast light mode for sunlight</span></span><Switch checked={light} onCheckedChange={setLight} /></label>
      <label className="flex items-center justify-between gap-4"><span><span className="block font-medium">Performance mode</span><span className="text-sm text-text-secondary">Removes blur and extra animation on older devices</span></span><Switch checked={perf} onCheckedChange={setPerf} /></label>
      <label className="flex items-center justify-between gap-4"><span><span className="block font-medium">Simulate offline</span><span className="text-sm text-text-secondary">Test how the POS behaves without internet</span></span><Switch checked={!online} onCheckedChange={() => toggleOnline()} /></label>
    </TSCard>
  );
}
