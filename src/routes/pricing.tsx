import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { SiteNav } from "@/components/ts/SiteNav";
import { Chip, Money, TSButton, TSCard } from "@/components/ts/primitives";
import { plans } from "@/config/pricing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — TabSprint POS" },
      { name: "description", content: "Simple plans for single outlets, busy venues and chains. Annual billing gets 2 months free." },
      { property: "og:title", content: "Pricing — TabSprint POS" },
      { property: "og:description", content: "Sprint, Rush and Chain plans. 14-day free trial." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="min-h-dvh">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h1 className="text-center text-5xl font-bold">Pricing that scales with the rush.</h1>
        <div className="mt-8 flex justify-center gap-2">
          <Chip active={!annual} onClick={() => setAnnual(false)}>Monthly</Chip>
          <Chip active={annual} onClick={() => setAnnual(true)}>Annual · 2 months free</Chip>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <TSCard key={p.id} raised={"popular" in p} className={cn("flex flex-col p-8", "popular" in p && "border-volt/50")}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{p.name}</h2>
                {"popular" in p && <span className="rounded-full bg-volt px-3 py-1 text-xs font-semibold text-ink-on-volt">Popular</span>}
              </div>
              <p className="mt-2 text-text-secondary">{p.blurb}</p>
              <div className="mt-6 text-4xl font-semibold">
                <Money value={annual ? p.monthly.INR * 10 : p.monthly.INR} />
                <span className="text-base text-muted-foreground">/{annual ? "yr" : "mo"}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check size={18} className="text-volt-text" />{f}</li>)}
              </ul>
              <Link to="/pos" className="mt-8"><TSButton variant={"popular" in p ? "primary" : "secondary"} className="w-full">Start free</TSButton></Link>
            </TSCard>
          ))}
        </div>
      </section>
    </div>
  );
}
