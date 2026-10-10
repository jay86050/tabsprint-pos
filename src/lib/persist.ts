import { toast } from "sonner";
import { idbGet, idbSet } from "./idb";
import { usePos } from "@/store/pos";
import { useKds } from "@/store/kds";
import { useVenueStore } from "@/store/venue";
import { useMenuStore } from "@/store/menu";
import { useOutbox } from "@/store/outbox";

type AnyStore = { getState: () => object; setState: (p: object) => void; subscribe: (fn: () => void) => () => void };
const slices: [string, AnyStore, string[]][] = [
  ["pos", usePos as unknown as AnyStore, ["tabs", "activeTab", "online"]],
  ["kds", useKds as unknown as AnyStore, ["tickets", "bumped"]],
  ["venue", useVenueStore as unknown as AnyStore, ["venueId", "tables", "overrides", "invites", "onboarded"]],
  ["menu", useMenuStore as unknown as AnyStore, ["menus"]],
  ["outbox", useOutbox as unknown as AnyStore, ["entries", "applied"]],
];

const pick = (o: object, keys: string[]) => Object.fromEntries(keys.map((k) => [k, (o as Record<string, unknown>)[k]]));

export async function syncOutbox(silent = false) {
  if (!usePos.getState().online) return;
  const pending = useOutbox.getState().entries.length;
  if (!pending) return;
  const id = silent ? undefined : toast.loading(`Syncing ${pending} queued order${pending > 1 ? "s" : ""}…`);
  try {
    const r = await useOutbox.getState().flush();
    if (r.synced || r.duplicates) toast.success(`${r.synced} order${r.synced === 1 ? "" : "s"} synced${r.duplicates ? `, ${r.duplicates} duplicate skipped` : ""}`, { id });
    else if (id) toast.dismiss(id);
  } catch {
    toast.error("Sync failed. Will retry when online.", { id });
  }
}

let started = false;
/** Load saved state from IndexedDB, then save every change. Call once on the client. */
export async function startPersistence() {
  if (started) return;
  started = true;
  for (const [key, store] of slices) {
    const saved = await idbGet<object>(`state:${key}`);
    if (saved) store.setState(saved);
  }
  for (const [key, store, keys] of slices) {
    let t: ReturnType<typeof setTimeout> | undefined;
    store.subscribe(() => {
      clearTimeout(t);
      t = setTimeout(() => void idbSet(`state:${key}`, pick(store.getState(), keys)), 150);
    });
  }
  const setOnline = (online: boolean) => {
    if (usePos.getState().online === online) return;
    usePos.setState({ online });
    if (online) void syncOutbox();
    else toast.warning("You're offline. Orders will queue and sync later.");
  };
  window.addEventListener("online", () => setOnline(true));
  window.addEventListener("offline", () => setOnline(false));
  if (!navigator.onLine) setOnline(false);
  void syncOutbox(true);
}
