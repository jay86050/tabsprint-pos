// Minimal promise wrapper over one IndexedDB object store (key/value).
const DB = "tabsprint";
const STORE = "kv";
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("no indexedDB"));
  dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((res, rej) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => res(req.result as T);
    req.onerror = () => rej(req.error);
  }));
}

export const idbGet = <T>(key: string) => tx<T | undefined>("readonly", (s) => s.get(key)).catch(() => undefined);
export const idbSet = (key: string, val: unknown) => tx<void>("readwrite", (s) => s.put(val, key)).catch(() => undefined);
