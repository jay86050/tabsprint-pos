import { createFileRoute } from "@tanstack/react-router";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { FileDown, ShieldAlert } from "lucide-react";
import { AppNav } from "@/components/ts/AppNav";
import { Money, Stat, TSButton, TSCard } from "@/components/ts/primitives";
import { LeakagePanel } from "@/components/ts/LeakagePanel";
import { topItems } from "@/data/venues";
import { useVenue } from "@/store/venue";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — TabSprint" },
      { name: "description", content: "Today's sales, hourly trend, top items, leakage alerts and day-end close." },
      { property: "og:title", content: "Owner dashboard — TabSprint" },
      { property: "og:description", content: "Check tonight's numbers from your phone." },
    ],
  }),
  component: Dashboard,
});

function CountUp({ to }: { to: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-IN"));
  useEffect(() => { const c = animate(mv, to, { duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }); return c.stop; }, [to]);
  return <motion.span>{text}</motion.span>;
}

const payColors = ["var(--volt)", "var(--info)", "var(--ember)", "var(--success)"];

function Dashboard() {
  const v = useVenue();
  const [close, setClose] = useState(false);
  const today = v.hourly.reduce((a, h) => a + h.today, 0);
  const lw = v.hourly.reduce((a, h) => a + h.lastWeek, 0);
  const delta = Math.round(((today - lw) / lw) * 100);
  const orders = Math.round(today / (v.type === "Food truck" ? 140 : v.currency === "AED" ? 180 : 1100));
  const items = useMemo(() => topItems(v), [v]);
  const pay = [{ n: "UPI", v: 46 }, { n: "Card", v: 31 }, { n: "Cash", v: 17 }, { n: "Wallet", v: 6 }];
  if (v.currency === "AED") { pay[0]!.n = "Apple Pay"; }

  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold">Tonight at {v.name}</h1>
            <p className="text-sm text-text-secondary">{v.city} · live</p>
          </div>
          <TSButton onClick={() => setClose(true)}>Close day</TSButton>
        </div>

        <div className="[perspective:1200px]">
          <motion.div initial={{ rotateX: 12, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="glass relative overflow-hidden rounded-xl border p-6 elev-3 md:p-8">
            <div className="volt-glow-bg pointer-events-none absolute -right-20 -top-20 h-80 w-80" />
            <div className="text-sm font-medium uppercase tracking-wider text-text-secondary">Today's sales</div>
            <div className="mt-2 font-mono text-5xl font-semibold text-volt-text tnum md:text-[64px]">
              <span className="mr-1 text-[0.6em] opacity-70">{v.symbol}</span><CountUp to={today} />
            </div>
            <div className={delta >= 0 ? "mt-2 text-success" : "mt-2 text-danger"}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs same day last week</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Orders" value={<span className="font-mono tnum">{orders}</span>} />
          <Stat label="Avg check" value={<Money value={Math.round(today / orders)} />} />
          <Stat label="Tips" value={<Money value={Math.round(today * 0.07)} />} />
          <Stat label="Table turn" value={<span className="font-mono tnum">{v.tables.length ? "52m" : "—"}</span>} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TSCard className="p-5 lg:col-span-2">
            <h2 className="font-semibold">Hourly sales</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={v.hourly}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--volt)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--volt)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="h" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Area dataKey="lastWeek" name="Last week" stroke="var(--text-muted)" fill="none" strokeDasharray="4 4" />
                  <Area dataKey="today" name="Today" stroke="var(--volt)" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TSCard>
          <TSCard className="p-5">
            <h2 className="font-semibold">Payment mix</h2>
            <div className="h-40"><ResponsiveContainer><PieChart><Pie data={pay} dataKey="v" nameKey="n" innerRadius={45} outerRadius={70} stroke="none">{pay.map((_, i) => <Cell key={i} fill={payColors[i]} />)}</Pie></PieChart></ResponsiveContainer></div>
            <ul className="space-y-1 text-sm">{pay.map((p, i) => <li key={p.n} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: payColors[i] }} />{p.n}</span><span className="font-mono tnum">{p.v}%</span></li>)}</ul>
          </TSCard>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ItemList title="Top items" list={items.slice(0, 5)} />
          <ItemList title="Slow movers" list={items.slice(-5).reverse()} />
          <TSCard className="p-5">
            <h2 className="font-semibold">Staff leaderboard</h2>
            <ul className="mt-3 space-y-3">{[...v.staff].sort((a, b) => b.sales - a.sales).map((s, i) => (
              <li key={s.id} className="flex items-center gap-3"><span className="w-4 font-mono text-text-secondary">{i + 1}</span><span className="flex-1">{s.name} <span className="text-xs text-muted-foreground">{s.role}</span></span><Money value={s.sales} /></li>
            ))}</ul>
          </TSCard>
        </div>

        <TSCard className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert size={20} className="text-ember" /> Leakage alerts</h2>
          <LeakagePanel />
        </TSCard>
      </main>
      {close && <CloseWizard sales={today} onClose={() => setClose(false)} />}
    </div>
  );
}

function ItemList({ title, list }: { title: string; list: { name: string; qty: number; revenue: number }[] }) {
  return (
    <TSCard className="p-5">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-3 space-y-3">{list.map((i) => (
        <li key={i.name} className="flex items-center gap-2 text-sm"><span className="flex-1 truncate">{i.name}</span><span className="font-mono text-text-secondary tnum">{i.qty}×</span><Money value={i.revenue} className="w-24 text-right" /></li>
      ))}</ul>
    </TSCard>
  );
}

function CloseWizard({ sales, onClose }: { sales: number; onClose: () => void }) {
  const v = useVenue();
  const expected = Math.round(sales * 0.17);
  const [actual, setActual] = useState("");
  const [step, setStep] = useState(0);
  const variance = actual === "" ? 0 : Number(actual) - expected;
  const exportCsv = () => {
    const rows = [["Venue", v.name], ["Gross sales", sales], [`${v.tax.label}`, Math.round(sales * v.tax.rate)], ["Expected cash", expected], ["Counted cash", actual], ["Variance", variance]];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `z-report-${v.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 md:items-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.32 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal
        className="w-full max-w-md rounded-t-xl border bg-card p-6 elev-3 md:rounded-xl">
        <div className="h-1.5 rounded-full bg-raised"><div className="h-full rounded-full bg-volt transition-all duration-200" style={{ width: `${(step + 1) * 50}%` }} /></div>
        {step === 0 ? (
          <>
            <h2 className="mt-5 text-2xl font-bold">Count the drawer</h2>
            <div className="mt-4 flex justify-between text-text-secondary"><span>Expected cash</span><Money value={expected} className="font-semibold text-foreground" /></div>
            <label className="mt-4 block text-sm font-medium text-text-secondary" htmlFor="cash">Counted cash</label>
            <input id="cash" inputMode="decimal" value={actual} onChange={(e) => setActual(e.target.value.replace(/[^\d.]/g, ""))} className="mt-2 h-14 w-full rounded-sm border bg-raised px-4 text-right font-mono text-2xl tnum outline-none" placeholder="0" />
            {actual !== "" && (
              <div className={variance === 0 ? "mt-3 text-success" : Math.abs(variance) > expected * 0.02 ? "mt-3 font-semibold text-danger" : "mt-3 text-warning"}>
                Variance: {variance > 0 ? "+" : ""}<Money value={variance} />
              </div>
            )}
            <TSButton size="lg" className="mt-6 w-full" disabled={actual === ""} onClick={() => setStep(1)}>Continue</TSButton>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-2xl font-bold">Z-report</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {[["Gross sales", sales], [`${v.tax.label} collected`, Math.round(sales * v.tax.rate)], ["Expected cash", expected], ["Counted cash", Number(actual)], ["Variance", variance]].map(([k, n]) => (
                <div key={k as string} className="flex justify-between"><dt className="text-text-secondary">{k}</dt><dd><Money value={n as number} /></dd></div>
              ))}
            </dl>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <TSButton variant="secondary" onClick={exportCsv}><FileDown size={18} /> CSV</TSButton>
              <TSButton variant="secondary" onClick={() => window.print()}><FileDown size={18} /> PDF</TSButton>
            </div>
            <TSButton size="lg" className="mt-3 w-full" onClick={onClose}>Close the day</TSButton>
          </>
        )}
      </motion.div>
    </div>
  );
}
