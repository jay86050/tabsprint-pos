import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, Logo, Money, Monogram, Stat, TSButton, TSCard, VegDot } from "@/components/ts/primitives";

export const Route = createFileRoute("/styleguide")({
  head: () => ({
    meta: [
      { title: "Styleguide — TabSprint design system" },
      { name: "description", content: "TabSprint colour, type, depth and component tokens." },
      { property: "og:title", content: "Styleguide — TabSprint" },
      { property: "og:description", content: "The Night Shift design system behind TabSprint." },
    ],
  }),
  component: Styleguide,
});

const swatches = ["ink-950", "ink-900", "ink-800", "ink-700", "ink-600", "volt", "volt-deep", "ember", "success", "warning", "danger", "info"];

function Styleguide() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-12">
      <header className="flex items-center justify-between"><Logo /><span className="text-sm text-muted-foreground">Design system v1</span></header>
      <section>
        <h2 className="text-2xl font-bold">Colour</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          {swatches.map((s) => (
            <div key={s}><div className="h-20 rounded-lg border elev-1" style={{ background: `var(--${s})` }} /><div className="mt-2 font-mono text-xs">{s}</div></div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Type</h2>
        <div className="mt-4 space-y-2">
          <div className="font-display text-[64px] font-bold leading-none">Display 64</div>
          <div className="font-display text-[36px] font-semibold">Heading 36</div>
          <div className="text-base">Body 16 Inter — calm under pressure.</div>
          <div className="text-[28px] font-semibold"><Money value={2480} /></div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Buttons</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <TSButton size="lg">Charge ₹2,480</TSButton>
          <TSButton variant="secondary" size="lg">Hold</TSButton>
          <TSButton variant="ghost">Ghost</TSButton>
          <TSButton variant="danger">Void</TSButton>
          <TSButton onClick={() => toast("Item removed", { action: { label: "Undo", onClick: () => {} }, duration: 5000 })} variant="secondary">Undo toast</TSButton>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Chips</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active>Cocktails</Chip><Chip>Beer</Chip><Chip tone="ember">Happy hour</Chip><Chip tone="success">Ready</Chip><Chip tone="warning">8 min</Chip><Chip tone="danger">Allergy: nuts</Chip>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Today's sales" value={<Money value={84320} />} delta={12} />
        <Stat label="Orders" value={<span className="font-mono tnum">142</span>} delta={-3} />
        <TSCard raised className="p-4"><Monogram name="Basil Gimlet" hue={130} /><div className="mt-3 flex items-center gap-2"><VegDot veg />Basil Gimlet</div></TSCard>
      </section>
    </div>
  );
}
