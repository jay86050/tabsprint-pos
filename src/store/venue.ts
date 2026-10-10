import { useMemo } from "react";
import { create } from "zustand";
import { venues, type Table, type TableStatus, type Venue } from "@/data/venues";

export type VenueOverride = Partial<Pick<Venue, "name" | "city" | "currency" | "symbol" | "tax">>;
export type StaffInvite = { name: string; role: string };

type State = {
  venueId: string;
  tables: Record<string, Table[]>;
  overrides: Record<string, VenueOverride>;
  invites: StaffInvite[];
  onboarded: boolean;
  setVenue: (id: string) => void;
  setTableStatus: (id: string, status: TableStatus) => void;
  moveTable: (id: string, x: number, y: number) => void;
  completeOnboarding: (venueId: string, o: VenueOverride, invites: StaffInvite[]) => void;
};

export const useVenueStore = create<State>((set) => ({
  venueId: "mumbai",
  tables: Object.fromEntries(venues.map((v) => [v.id, v.tables])),
  overrides: {},
  invites: [],
  onboarded: false,
  setVenue: (venueId) => set({ venueId }),
  setTableStatus: (id, status) =>
    set((s) => ({ tables: { ...s.tables, [s.venueId]: (s.tables[s.venueId] ?? []).map((t) => (t.id === id ? { ...t, status, since: Date.now() } : t)) } })),
  moveTable: (id, x, y) =>
    set((s) => ({ tables: { ...s.tables, [s.venueId]: (s.tables[s.venueId] ?? []).map((t) => (t.id === id ? { ...t, x, y } : t)) } })),
  completeOnboarding: (venueId, o, invites) => set((s) => ({ venueId, overrides: { ...s.overrides, [venueId]: o }, invites, onboarded: true })),
}));

export function useVenue(): Venue {
  const id = useVenueStore((s) => s.venueId);
  const o = useVenueStore((s) => s.overrides[id]);
  return useMemo(() => ({ ...venues.find((v) => v.id === id)!, ...o }), [id, o]);
}
