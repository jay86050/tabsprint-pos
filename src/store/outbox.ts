import { create } from "zustand";

export type OutboxEntry = { id: string; kind: "order"; label: string; total: number; payload: unknown; createdAt: number; attempts: number };

type State = {
  entries: OutboxEntry[];
  applied: string[]; // ids the "server" has accepted — replays with same id are ignored
  enqueue: (e: Omit<OutboxEntry, "id" | "createdAt" | "attempts">) => string;
  flush: () => Promise<{ synced: number; duplicates: number }>;
};

/** Device-scoped, time-ordered id: safe to generate offline on many terminals without collisions. */
export function newId(device = deviceId()) {
  const t = Date.now().toString(36).padStart(9, "0");
  return `${device}-${t}-${crypto.randomUUID().slice(0, 8)}`;
}

let _device: string | null = null;
export function deviceId() {
  if (_device) return _device;
  try {
    _device = localStorage.getItem("ts-device") ?? `d${crypto.randomUUID().slice(0, 6)}`;
    localStorage.setItem("ts-device", _device);
  } catch { _device = "dsrv"; }
  return _device;
}

/** Idempotent apply: returns which entries are new vs already accepted. */
export function applyBatch(applied: string[], batch: OutboxEntry[]) {
  const seen = new Set(applied);
  let synced = 0, duplicates = 0;
  for (const e of batch) {
    if (seen.has(e.id)) duplicates++;
    else { seen.add(e.id); synced++; }
  }
  return { applied: [...seen].slice(-500), synced, duplicates };
}

let flushing = false;
export const useOutbox = create<State>((set, get) => ({
  entries: [],
  applied: [],
  enqueue: (e) => {
    const id = newId();
    set((s) => ({ entries: [...s.entries, { ...e, id, createdAt: Date.now(), attempts: 0 }] }));
    return id;
  },
  flush: async () => {
    if (flushing || get().entries.length === 0) return { synced: 0, duplicates: 0 };
    flushing = true;
    try {
      const batch = [...get().entries].sort((a, b) => a.createdAt - b.createdAt);
      await new Promise((r) => setTimeout(r, 400)); // simulated network round trip
      const r = applyBatch(get().applied, batch);
      const ids = new Set(batch.map((b) => b.id));
      set((s) => ({ applied: r.applied, entries: s.entries.filter((e) => !ids.has(e.id)) }));
      return { synced: r.synced, duplicates: r.duplicates };
    } finally {
      flushing = false;
    }
  },
}));
