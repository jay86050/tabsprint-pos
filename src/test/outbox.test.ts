import { describe, it, expect } from "vitest";
import { applyBatch, newId, type OutboxEntry } from "@/store/outbox";
import { parseMenuCsv } from "@/store/menu";

const e = (id: string): OutboxEntry => ({ id, kind: "order", label: "x", total: 1, payload: null, createdAt: 0, attempts: 0 });

describe("offline outbox", () => {
  it("skips orders the server already accepted when replayed", () => {
    const r = applyBatch(["a"], [e("a"), e("b"), e("b")]);
    expect(r.synced).toBe(1);
    expect(r.duplicates).toBe(2);
  });
  it("ids from two devices never collide", () => {
    expect(newId("d1")).not.toBe(newId("d1"));
    expect(newId("d1").startsWith("d1-")).toBe(true);
  });
});

describe("menu CSV import", () => {
  it("reads name, price, category, veg and station", () => {
    const r = parseMenuCsv("name,price,category,veg,station\nVada Pav,40,Street,yes,Kitchen\nChicken Roll,110,Rolls,no,Grill");
    expect(r.items).toHaveLength(2);
    expect(r.items[1]).toMatchObject({ name: "Chicken Roll", price: 110, cat: "Rolls", veg: false, station: "Grill" });
    expect(r.categories).toEqual(["Street", "Rolls"]);
  });
});
