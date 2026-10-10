import { create } from "zustand";
import { venues } from "@/data/venues";
import type { MenuItem } from "@/data/menu";
import { useVenueStore } from "./venue";

export type ModOption = { id: string; name: string; price: number };
export type ModifierGroup = { id: string; name: string; kind: "size" | "addon" | "spice"; required: boolean; multi: boolean; options: ModOption[] };
export type VenueMenu = { categories: string[]; items: MenuItem[]; groups: ModifierGroup[] };

const defaultGroups = (): ModifierGroup[] => [
  { id: "g-size", name: "Size", kind: "size", required: true, multi: false, options: [{ id: "o1", name: "Regular", price: 0 }, { id: "o2", name: "Large", price: 80 }] },
  { id: "g-add", name: "Add-ons", kind: "addon", required: false, multi: true, options: [{ id: "o3", name: "Extra cheese", price: 50 }, { id: "o4", name: "Fried egg", price: 40 }] },
  { id: "g-spice", name: "Spice level", kind: "spice", required: false, multi: false, options: [{ id: "o5", name: "Mild", price: 0 }, { id: "o6", name: "Medium", price: 0 }, { id: "o7", name: "Hot", price: 0 }] },
];

export const seedMenu = (venueId: string): VenueMenu => {
  const v = venues.find((x) => x.id === venueId) ?? venues[0]!;
  return { categories: [...v.categories], items: v.menu.map((m) => ({ ...m })), groups: defaultGroups() };
};

type State = {
  menus: Record<string, VenueMenu>;
  setMenu: (venueId: string, m: VenueMenu) => void;
  upsertItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  patchItem: (id: string, p: Partial<MenuItem>) => void;
  addCategory: (name: string) => void;
  renameCategory: (from: string, to: string) => void;
  removeCategory: (name: string) => void;
  upsertGroup: (g: ModifierGroup) => void;
  removeGroup: (id: string) => void;
};

const cur = () => useVenueStore.getState().venueId;
const edit = (s: State, fn: (m: VenueMenu) => VenueMenu) => {
  const id = cur();
  return { menus: { ...s.menus, [id]: fn(s.menus[id] ?? seedMenu(id)) } };
};

export const useMenuStore = create<State>((set) => ({
  menus: Object.fromEntries(venues.map((v) => [v.id, seedMenu(v.id)])),
  setMenu: (venueId, m) => set((s) => ({ menus: { ...s.menus, [venueId]: m } })),
  upsertItem: (item) => set((s) => edit(s, (m) => ({ ...m, items: m.items.some((i) => i.id === item.id) ? m.items.map((i) => (i.id === item.id ? item : i)) : [...m.items, item] }))),
  removeItem: (id) => set((s) => edit(s, (m) => ({ ...m, items: m.items.filter((i) => i.id !== id) }))),
  patchItem: (id, p) => set((s) => edit(s, (m) => ({ ...m, items: m.items.map((i) => (i.id === id ? { ...i, ...p } : i)) }))),
  addCategory: (name) => set((s) => edit(s, (m) => (m.categories.includes(name) ? m : { ...m, categories: [...m.categories, name] }))),
  renameCategory: (from, to) => set((s) => edit(s, (m) => ({ ...m, categories: m.categories.map((c) => (c === from ? to : c)), items: m.items.map((i) => (i.cat === from ? { ...i, cat: to } : i)) }))),
  removeCategory: (name) => set((s) => edit(s, (m) => ({ ...m, categories: m.categories.filter((c) => c !== name), items: m.items.filter((i) => i.cat !== name) }))),
  upsertGroup: (g) => set((s) => edit(s, (m) => ({ ...m, groups: m.groups.some((x) => x.id === g.id) ? m.groups.map((x) => (x.id === g.id ? g : x)) : [...m.groups, g] }))),
  removeGroup: (id) => set((s) => edit(s, (m) => ({ ...m, groups: m.groups.filter((x) => x.id !== id), items: m.items.map((i) => ({ ...i, groups: i.groups?.filter((x) => x !== id) })) }))),
}));

export function useVenueMenu(): VenueMenu {
  const id = useVenueStore((s) => s.venueId);
  return useMenuStore((s) => s.menus[id]) ?? seedMenu(id);
}

/** Parse "name,price,category,veg,station" CSV (header optional). */
export function parseMenuCsv(text: string): { categories: string[]; items: MenuItem[] } {
  const rows = text.split(/\r?\n/).map((r) => r.split(",").map((c) => c.trim())).filter((r) => r.length >= 2 && r[0]);
  if (rows[0] && isNaN(Number(rows[0][1]))) rows.shift();
  const items: MenuItem[] = rows.map((r, i) => ({
    id: `csv${i}-${Date.now().toString(36)}`,
    name: r[0]!,
    price: Number(r[1]) || 0,
    cat: r[2] || "Menu",
    veg: !/^(n|no|false|non-?veg|0)$/i.test(r[3] ?? "y"),
    station: (["Bar", "Kitchen", "Grill"].includes(r[4] ?? "") ? r[4] : "Kitchen") as MenuItem["station"],
    hue: (i * 47) % 360,
  }));
  return { categories: [...new Set(items.map((i) => i.cat))], items };
}
