import { create } from "zustand";
import { GST_RATE, type MenuItem } from "@/data/menu";

export type Line = { id: string; item: MenuItem; qty: number; note?: string };
export type Tab = { id: string; name: string; openedAt: number; lines: Line[]; idCheck?: boolean };

type State = {
  tabs: Tab[];
  activeTab: string;
  online: boolean;
  queued: number;
  add: (item: MenuItem) => void;
  dec: (lineId: string) => void;
  remove: (lineId: string) => Line | undefined;
  restore: (line: Line) => void;
  openTab: (name: string) => void;
  setActive: (id: string) => void;
  closeActive: () => void;
  toggleOnline: () => number;
};

const now = Date.now();
export const usePos = create<State>((set, get) => ({
  tabs: [
    { id: "t14", name: "Tab #14 · Riya", openedAt: now - 42 * 60e3, lines: [], idCheck: true },
    { id: "t15", name: "Tab #15 · Bar 3", openedAt: now - 12 * 60e3, lines: [] },
  ],
  activeTab: "t14",
  online: true,
  queued: 0,
  add: (item) =>
    set((s) => ({
      queued: s.online ? s.queued : s.queued + 1,
      tabs: s.tabs.map((t) => {
        if (t.id !== s.activeTab) return t;
        const ex = t.lines.find((l) => l.item.id === item.id);
        return {
          ...t,
          lines: ex
            ? t.lines.map((l) => (l === ex ? { ...l, qty: l.qty + 1 } : l))
            : [...t.lines, { id: crypto.randomUUID(), item, qty: 1 }],
        };
      }),
    })),
  dec: (lineId) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id !== s.activeTab ? t : { ...t, lines: t.lines.flatMap((l) => (l.id !== lineId ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])) },
      ),
    })),
  remove: (lineId) => {
    const tab = get().tabs.find((t) => t.id === get().activeTab);
    const line = tab?.lines.find((l) => l.id === lineId);
    set((s) => ({ tabs: s.tabs.map((t) => (t.id !== s.activeTab ? t : { ...t, lines: t.lines.filter((l) => l.id !== lineId) })) }));
    return line;
  },
  restore: (line) => set((s) => ({ tabs: s.tabs.map((t) => (t.id !== s.activeTab ? t : { ...t, lines: [...t.lines, line] })) })),
  openTab: (name) =>
    set((s) => {
      const n = 14 + s.tabs.length;
      const id = `t${n}-${Date.now()}`;
      return { tabs: [...s.tabs, { id, name: `Tab #${n} · ${name}`, openedAt: Date.now(), lines: [] }], activeTab: id };
    }),
  setActive: (id) => set({ activeTab: id }),
  closeActive: () =>
    set((s) => {
      const rest = s.tabs.filter((t) => t.id !== s.activeTab);
      if (rest.length === 0) {
        const id = `t-${Date.now()}`;
        return { tabs: [{ id, name: "Walk-in", openedAt: Date.now(), lines: [] }], activeTab: id };
      }
      return { tabs: rest, activeTab: rest[0]!.id };
    }),
  toggleOnline: () => {
    const synced = get().online ? 0 : get().queued;
    set((s) => ({ online: !s.online, queued: s.online ? s.queued : 0 }));
    return synced;
  },
}));

export function totals(lines: Line[]) {
  const subtotal = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  return { subtotal, tax, cgst: tax / 2, sgst: tax / 2, total: subtotal + tax };
}
