import { create } from "zustand";
import type { Line } from "./pos";

export type Station = "Kitchen" | "Bar" | "Grill";
export type TicketStatus = "new" | "preparing" | "ready";
export type Ticket = {
  id: string;
  label: string;
  station: Station;
  status: TicketStatus;
  createdAt: number;
  course?: number;
  items: { name: string; qty: number; note?: string; allergy?: string }[];
};

const m = 60e3;
const now = Date.now();
const seed: Ticket[] = [
  { id: "k1", label: "Table 4", station: "Kitchen", status: "new", createdAt: now - 2 * m, course: 1, items: [{ name: "Truffle Fries", qty: 2 }, { name: "Paneer Tikka", qty: 1, allergy: "Dairy" }] },
  { id: "k2", label: "Tab #14 · Riya", station: "Bar", status: "new", createdAt: now - 1 * m, items: [{ name: "Negroni", qty: 2 }, { name: "Espresso Martini", qty: 1 }] },
  { id: "k3", label: "Table 7", station: "Grill", status: "preparing", createdAt: now - 9 * m, course: 2, items: [{ name: "Smash Burger", qty: 2, note: "No onion" }, { name: "Fish Tacos", qty: 1, allergy: "Shellfish" }] },
  { id: "k4", label: "Table 2", station: "Kitchen", status: "preparing", createdAt: now - 13 * m, course: 1, items: [{ name: "Chilli Chicken Bao", qty: 3, allergy: "Nuts" }] },
  { id: "k5", label: "Takeaway #88", station: "Kitchen", status: "ready", createdAt: now - 15 * m, items: [{ name: "Wild Mushroom Pizza", qty: 1 }] },
];

type State = {
  tickets: Ticket[];
  bumped: Ticket[];
  push: (lines: Line[], label: string) => number;
  bump: (id: string) => void;
  recall: () => void;
  simulate: () => void;
};

const next: Record<TicketStatus, TicketStatus | null> = { new: "preparing", preparing: "ready", ready: null };
const sample = ["Nachos Grande", "Kokum Margarita", "Butter Chicken Bowl", "Craft IPA Tap", "Smash Burger", "Molten Chocolate"];
const stationOf = (n: string): Station => (/Margarita|IPA|Negroni|Martini|Pint|Beer|Chai|Coffee|Lemonade|Lassi/i.test(n) ? "Bar" : /Burger|Taco|Tikka|Grill|Frankie|Kofta|Tawook/i.test(n) ? "Grill" : "Kitchen");

export const useKds = create<State>((set, get) => ({
  tickets: seed,
  bumped: [],
  push: (lines, label) => {
    const groups = new Map<Station, Ticket["items"]>();
    lines.forEach((l) => {
      const st = l.item.station;
      groups.set(st, [...(groups.get(st) ?? []), { name: l.item.name, qty: l.qty }]);
    });
    const created = [...groups].map(([station, items]) => ({ id: crypto.randomUUID(), label, station, status: "new" as const, createdAt: Date.now(), items }));
    set((s) => ({ tickets: [...s.tickets, ...created] }));
    return created.length;
  },
  bump: (id) =>
    set((s) => {
      const t = s.tickets.find((x) => x.id === id);
      if (!t) return s;
      const n = next[t.status];
      if (!n) return { tickets: s.tickets.filter((x) => x.id !== id), bumped: [t, ...s.bumped].slice(0, 10) };
      return { tickets: s.tickets.map((x) => (x.id === id ? { ...x, status: n } : x)) };
    }),
  recall: () => {
    const [last, ...rest] = get().bumped;
    if (last) set((s) => ({ tickets: [...s.tickets, { ...last, status: "ready" }], bumped: rest }));
  },
  simulate: () => {
    const a = sample[Math.floor(Math.random() * sample.length)]!;
    const t: Ticket = { id: crypto.randomUUID(), label: `Table ${1 + Math.floor(Math.random() * 10)}`, station: stationOf(a), status: "new", createdAt: Date.now(), items: [{ name: a, qty: 1 + Math.floor(Math.random() * 3) }] };
    if (Math.random() > 0.6) t.items[0]!.allergy = "Gluten";
    set((s) => ({ tickets: [...s.tickets, t] }));
  },
}));

export function ageColor(mins: number) {
  return mins >= 12 ? "danger" : mins >= 8 ? "warning" : "ok";
}
