import { create } from "zustand";
import { venues, type Table, type TableStatus } from "@/data/venues";

type State = {
  venueId: string;
  tables: Record<string, Table[]>;
  setVenue: (id: string) => void;
  setTableStatus: (id: string, status: TableStatus) => void;
  moveTable: (id: string, x: number, y: number) => void;
};

export const useVenueStore = create<State>((set) => ({
  venueId: "mumbai",
  tables: Object.fromEntries(venues.map((v) => [v.id, v.tables])),
  setVenue: (venueId) => set({ venueId }),
  setTableStatus: (id, status) =>
    set((s) => ({ tables: { ...s.tables, [s.venueId]: (s.tables[s.venueId] ?? []).map((t) => (t.id === id ? { ...t, status, since: Date.now() } : t)) } })),
  moveTable: (id, x, y) =>
    set((s) => ({ tables: { ...s.tables, [s.venueId]: (s.tables[s.venueId] ?? []).map((t) => (t.id === id ? { ...t, x, y } : t)) } })),
}));

export function useVenue() {
  const id = useVenueStore((s) => s.venueId);
  return venues.find((v) => v.id === id)!;
}
