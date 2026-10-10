import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppNav } from "@/components/ts/AppNav";
import { Chip, Money, TSButton, TSCard, VegDot } from "@/components/ts/primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useMenuStore, useVenueMenu, type ModifierGroup } from "@/store/menu";
import { useVenue } from "@/store/venue";
import type { MenuItem } from "@/data/menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu manager — TabSprint" },
      { name: "description", content: "Edit categories, prices, tax, modifiers and 86 items in seconds." },
      { property: "og:title", content: "Menu manager — TabSprint" },
      { property: "og:description", content: "Manage your TabSprint menu, modifiers and stock." },
    ],
  }),
  component: MenuPage,
});

const field = "mt-1.5 h-11 w-full rounded-md border bg-raised px-3 outline-none focus:border-volt";

function MenuPage() {
  const m = useVenueMenu();
  const venue = useVenue();
  const st = useMenuStore();
  const [cat, setCat] = useState<string>("All");
  const [tab, setTab] = useState<"items" | "mods">("items");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [group, setGroup] = useState<ModifierGroup | null>(null);
  const list = cat === "All" ? m.items : m.items.filter((i) => i.cat === cat);

  const newItem = (): MenuItem => ({ id: `i-${Date.now().toString(36)}`, name: "", price: 0, cat: cat === "All" ? m.categories[0] ?? "Menu" : cat, veg: true, station: "Kitchen", hue: Math.floor(Math.random() * 360), groups: [] });
  const addCat = () => { const n = prompt("Category name")?.trim(); if (n) { st.addCategory(n); setCat(n); } };
  const renameCat = (c: string) => { const n = prompt("Rename category", c)?.trim(); if (n && n !== c) { st.renameCategory(c, n); setCat(n); } };
  const delCat = (c: string) => { if (confirm(`Delete "${c}" and its items?`)) { st.removeCategory(c); setCat("All"); } };

  return (
    <div className="min-h-dvh bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="font-display text-2xl font-semibold">Menu</h1><p className="text-sm text-muted-foreground">{m.items.length} items · {m.items.filter((i) => i.out).length} 86'd · saved on this device</p></div>
          <div className="flex gap-2">
            <Chip active={tab === "items"} onClick={() => setTab("items")}>Items</Chip>
            <Chip active={tab === "mods"} onClick={() => setTab("mods")}>Modifier groups</Chip>
          </div>
        </div>

        {tab === "items" ? (
          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
            <aside className="space-y-1">
              {["All", ...m.categories].map((c) => (
                <div key={c} className={cn("group flex h-11 items-center rounded-md px-3 text-sm", cat === c ? "bg-raised text-foreground" : "text-text-secondary hover:bg-raised")}>
                  <button className="flex-1 text-left" onClick={() => setCat(c)}>{c} <span className="ml-1 font-mono text-xs text-muted-foreground">{c === "All" ? m.items.length : m.items.filter((i) => i.cat === c).length}</span></button>
                  {c !== "All" && <span className="flex gap-1 opacity-0 group-hover:opacity-100"><button aria-label="Rename" onClick={() => renameCat(c)}><Pencil size={14} /></button><button aria-label="Delete" onClick={() => delCat(c)}><Trash2 size={14} /></button></span>}
                </div>
              ))}
              <TSButton variant="ghost" className="w-full justify-start" onClick={addCat}><Plus size={16} /> Category</TSButton>
            </aside>
            <section>
              <div className="mb-3 flex justify-end"><TSButton onClick={() => setEditing(newItem())}><Plus size={18} /> New item</TSButton></div>
              <TSCard className="divide-y">
                {list.map((i) => (
                  <div key={i.id} className={cn("flex items-center gap-3 px-4 py-3", i.out && "opacity-60")}>
                    <VegDot veg={i.veg} />
                    <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(i)}>
                      <div className={cn("truncate font-medium", i.out && "line-through")}>{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.cat} · {i.station} · tax {Math.round((i.taxRate ?? venue.tax.rate) * 100)}%{i.groups?.length ? ` · ${i.groups.length} modifier${i.groups.length > 1 ? "s" : ""}` : ""}</div>
                    </button>
                    <Money value={i.price} className="w-20 text-right" />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">86<Switch checked={!!i.out} onCheckedChange={(v) => { st.patchItem(i.id, { out: v }); toast(v ? `${i.name} 86'd` : `${i.name} back on`); }} /></label>
                    <TSButton variant="ghost" aria-label="Edit" onClick={() => setEditing(i)}><Pencil size={16} /></TSButton>
                  </div>
                ))}
                {!list.length && <div className="p-8 text-center text-sm text-muted-foreground">No items yet.</div>}
              </TSCard>
            </section>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-3 flex justify-end"><TSButton onClick={() => setGroup({ id: `g-${Date.now().toString(36)}`, name: "", kind: "addon", required: false, multi: true, options: [{ id: "o0", name: "", price: 0 }] })}><Plus size={18} /> New group</TSButton></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {m.groups.map((g) => (
                <TSCard key={g.id} className="p-4">
                  <div className="flex items-center justify-between"><div className="font-semibold">{g.name}</div><Chip tone="info" className="h-7 px-2 text-xs">{g.kind}</Chip></div>
                  <div className="mt-1 text-xs text-muted-foreground">{g.required ? "Required" : "Optional"} · {g.multi ? "Pick many" : "Pick one"} · used by {m.items.filter((i) => i.groups?.includes(g.id)).length}</div>
                  <ul className="mt-3 space-y-1 text-sm">{g.options.map((o) => <li key={o.id} className="flex justify-between"><span>{o.name}</span><span className="font-mono tnum text-muted-foreground">{o.price ? `+${o.price}` : "—"}</span></li>)}</ul>
                  <div className="mt-3 flex gap-2"><TSButton variant="secondary" onClick={() => setGroup(g)}>Edit</TSButton><TSButton variant="danger" onClick={() => st.removeGroup(g.id)}>Delete</TSButton></div>
                </TSCard>
              ))}
            </div>
          </div>
        )}
      </main>
      {editing && <ItemDialog item={editing} categories={m.categories} groups={m.groups} defaultRate={venue.tax.rate} onClose={() => setEditing(null)} />}
      {group && <GroupDialog group={group} onClose={() => setGroup(null)} />}
    </div>
  );
}

function ItemDialog({ item, categories, groups, defaultRate, onClose }: { item: MenuItem; categories: string[]; groups: ModifierGroup[]; defaultRate: number; onClose: () => void }) {
  const [d, setD] = useState<MenuItem>(item);
  const st = useMenuStore();
  const exists = useVenueMenu().items.some((i) => i.id === item.id);
  const save = () => {
    if (!d.name.trim()) return toast.error("Give the item a name");
    st.upsertItem({ ...d, name: d.name.trim() });
    toast.success(exists ? "Item updated" : "Item added");
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{exists ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Name<input autoFocus value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={field} /></label>
          <label className="text-sm font-medium">Price<input type="number" min={0} value={d.price} onChange={(e) => setD({ ...d, price: Number(e.target.value) })} className={cn(field, "font-mono")} /></label>
          <label className="text-sm font-medium">Tax rate (%)<input type="number" min={0} max={40} placeholder={`${defaultRate * 100} (venue)`} value={d.taxRate === undefined ? "" : d.taxRate * 100} onChange={(e) => setD({ ...d, taxRate: e.target.value === "" ? undefined : Number(e.target.value) / 100 })} className={cn(field, "font-mono")} /></label>
          <label className="text-sm font-medium">Category<select value={d.cat} onChange={(e) => setD({ ...d, cat: e.target.value })} className={field}>{categories.map((c) => <option key={c} className="bg-card">{c}</option>)}</select></label>
          <label className="text-sm font-medium">Station<select value={d.station} onChange={(e) => setD({ ...d, station: e.target.value as MenuItem["station"] })} className={field}>{["Kitchen", "Bar", "Grill"].map((c) => <option key={c} className="bg-card">{c}</option>)}</select></label>
          <label className="flex items-center justify-between rounded-md border bg-raised px-3 py-2 text-sm">Vegetarian<Switch checked={d.veg} onCheckedChange={(v) => setD({ ...d, veg: v })} /></label>
          <label className="flex items-center justify-between rounded-md border bg-raised px-3 py-2 text-sm">86'd (out of stock)<Switch checked={!!d.out} onCheckedChange={(v) => setD({ ...d, out: v })} /></label>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Modifier groups</legend>
            <div className="mt-2 flex flex-wrap gap-2">{groups.map((g) => { const on = d.groups?.includes(g.id); return <Chip key={g.id} active={on} onClick={() => setD({ ...d, groups: on ? d.groups!.filter((x) => x !== g.id) : [...(d.groups ?? []), g.id] })}>{g.name}</Chip>; })}</div>
          </fieldset>
        </div>
        <div className="mt-4 flex justify-between">
          {exists ? <TSButton variant="danger" onClick={() => { st.removeItem(d.id); toast(`${d.name} deleted`); onClose(); }}>Delete</TSButton> : <span />}
          <div className="flex gap-2"><TSButton variant="ghost" onClick={onClose}>Cancel</TSButton><TSButton onClick={save}>Save</TSButton></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GroupDialog({ group, onClose }: { group: ModifierGroup; onClose: () => void }) {
  const [g, setG] = useState(group);
  const save = () => {
    const options = g.options.filter((o) => o.name.trim());
    if (!g.name.trim() || !options.length) return toast.error("Add a name and at least one option");
    useMenuStore.getState().upsertGroup({ ...g, options });
    toast.success("Modifier group saved");
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Modifier group</DialogTitle></DialogHeader>
        <label className="text-sm font-medium">Name<input autoFocus value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} className={field} /></label>
        <div className="flex flex-wrap gap-2">{(["size", "addon", "spice"] as const).map((k) => <Chip key={k} active={g.kind === k} onClick={() => setG({ ...g, kind: k, multi: k === "addon" })}>{k === "addon" ? "Add-ons" : k === "size" ? "Sizes" : "Spice level"}</Chip>)}</div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><Switch checked={g.required} onCheckedChange={(v) => setG({ ...g, required: v })} />Required</label>
          <label className="flex items-center gap-2"><Switch checked={g.multi} onCheckedChange={(v) => setG({ ...g, multi: v })} />Pick many</label>
        </div>
        <div className="space-y-2">
          {g.options.map((o, i) => (
            <div key={o.id} className="flex gap-2">
              <input value={o.name} placeholder="Option" onChange={(e) => setG({ ...g, options: g.options.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className="h-11 flex-1 rounded-md border bg-raised px-3" />
              <input type="number" value={o.price} aria-label="Extra price" onChange={(e) => setG({ ...g, options: g.options.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)) })} className="h-11 w-24 rounded-md border bg-raised px-3 font-mono" />
              <TSButton variant="ghost" aria-label="Remove" onClick={() => setG({ ...g, options: g.options.filter((_, j) => j !== i) })}><Trash2 size={16} /></TSButton>
            </div>
          ))}
          <TSButton variant="ghost" onClick={() => setG({ ...g, options: [...g.options, { id: `o-${Date.now().toString(36)}`, name: "", price: 0 }] })}><Plus size={16} /> Option</TSButton>
        </div>
        <div className="flex justify-end gap-2"><TSButton variant="ghost" onClick={onClose}>Cancel</TSButton><TSButton onClick={save}>Save</TSButton></div>
      </DialogContent>
    </Dialog>
  );
}
