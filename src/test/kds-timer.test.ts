import { describe, it, expect } from "vitest";
import { ageColor } from "@/store/kds";
import { totals } from "@/store/pos";
import { menu } from "@/data/menu";

describe("KDS ticket timer", () => {
  it("stays normal under 8 minutes", () => expect(ageColor(7)).toBe("ok"));
  it("turns amber at 8 minutes", () => expect(ageColor(8)).toBe("warning"));
  it("turns red at 12 minutes", () => expect(ageColor(12)).toBe("danger"));
});

describe("VAT", () => {
  it("applies 5% VAT without a CGST/SGST split", () => {
    const t = totals([{ id: "a", item: { ...menu[0]!, price: 100 }, qty: 1 }], 0.05, false);
    expect(t.tax).toBe(5);
    expect(t.total).toBe(105);
  });
});
