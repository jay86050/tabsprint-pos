// Edit plan prices here. Annual = 10x monthly ("2 months free").
export const plans = [
  {
    id: "sprint",
    name: "Sprint",
    blurb: "One outlet, the full core POS.",
    monthly: { INR: 1499, USD: 29 },
    features: ["POS, tabs and tables", "Kitchen display", "QR ordering", "Offline mode", "GST/VAT engine"],
  },
  {
    id: "rush",
    name: "Rush",
    blurb: "For busy venues that want more.",
    monthly: { INR: 3499, USD: 69 },
    popular: true,
    features: ["Everything in Sprint", "Inventory and recipe cost", "Delivery hub", "Reservations", "Loyalty and gift cards"],
  },
  {
    id: "chain",
    name: "Chain",
    blurb: "Multi-outlet control from HQ.",
    monthly: { INR: 7999, USD: 149 },
    features: ["Everything in Rush", "Unlimited outlets", "Public API", "Leakage alerts across outlets", "Priority support"],
  },
] as const;
