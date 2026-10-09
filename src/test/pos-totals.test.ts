import { describe, it, expect } from "vitest";
import { totals } from "@/store/pos";
import { menu } from "@/data/menu";

describe("GST totals", () => {
  it("adds 5% GST split equally into CGST and SGST", () => {
    const t = totals([{ id: "a", item: { ...menu[0]!, price: 1000 }, qty: 2 }]);
    expect(t.subtotal).toBe(2000);
    expect(t.tax).toBe(100);
    expect(t.cgst).toBe(50);
    expect(t.total).toBe(2100);
  });
});
