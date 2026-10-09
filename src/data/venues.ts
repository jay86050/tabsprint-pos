import { categories as barCats, menu as barMenu, type MenuItem } from "./menu";

export type TableStatus = "free" | "seated" | "ordered" | "bill" | "cleaning";
export type Table = { id: string; n: number; zone: "Bar" | "Patio" | "Main"; seats: number; status: TableStatus; since: number; x: number; y: number; round?: boolean };
export type Staff = { id: string; name: string; role: string; sales: number; risk: number };
export type Leak = { id: string; staff: string; kind: "Void after payment" | "Discount over threshold" | "Comp" | "Cash mismatch" | "No-sale drawer" | "Deleted bill"; amount: number; minsAgo: number; order: string; timeline: [string, string][] };

export type Venue = {
  id: string;
  name: string;
  city: string;
  type: "Bar" | "Dine-in" | "Food truck";
  currency: "INR" | "AED";
  symbol: string;
  tax: { label: string; rate: number; split: boolean; serviceCharge: number; inclusive: boolean };
  categories: string[];
  menu: MenuItem[];
  tables: Table[];
  staff: Staff[];
  leaks: Leak[];
  hourly: { h: string; today: number; lastWeek: number }[];
  daily: number[]; // 14 days
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop&auto=format&q=60`;
let seq = 0;
const mk = (name: string, price: number, cat: string, veg: boolean, station: MenuItem["station"], photo?: string, extra: Partial<MenuItem> = {}): MenuItem => ({
  id: `i${++seq}`, name, price, cat, veg, station, hue: (seq * 47) % 360, ...(photo ? { photo: u(photo) } : {}), ...extra,
});

const dubaiMenu: MenuItem[] = [
  mk("Hummus Beiruti", 32, "Mezze", true, "Kitchen", "photo-1577805947697-89e18249d767"),
  mk("Fattoush", 36, "Mezze", true, "Kitchen"),
  mk("Halloumi Grill", 42, "Mezze", true, "Grill"),
  mk("Lamb Kibbeh", 48, "Mezze", false, "Kitchen", undefined, { stock: 5 }),
  mk("Muhammara", 30, "Mezze", true, "Kitchen"),
  mk("Mixed Grill Platter", 145, "Grill", false, "Grill", "photo-1544025162-d76694265947"),
  mk("Shish Tawook", 78, "Grill", false, "Grill"),
  mk("Wagyu Kofta", 120, "Grill", false, "Grill"),
  mk("Hammour Sayadieh", 135, "Mains", false, "Kitchen"),
  mk("Lamb Ouzi", 160, "Mains", false, "Kitchen", "photo-1603360946369-dc9bb6258143"),
  mk("Chicken Machboos", 95, "Mains", false, "Kitchen"),
  mk("Truffle Mushroom Risotto", 88, "Mains", true, "Kitchen", undefined, { out: true }),
  mk("Kunafa", 45, "Desserts", true, "Kitchen", "photo-1579888944880-d98341245702"),
  mk("Umm Ali", 38, "Desserts", true, "Kitchen"),
  mk("Mint Lemonade", 28, "Drinks", true, "Bar", "photo-1513558161293-cdaf765ed2fd"),
  mk("Karak Chai", 18, "Drinks", true, "Bar"),
  mk("Turkish Coffee", 22, "Drinks", true, "Bar"),
  mk("Fresh Pomegranate", 32, "Drinks", true, "Bar"),
];

const puneMenu: MenuItem[] = [
  mk("Vada Pav", 40, "Street", true, "Kitchen", "photo-1606491956689-2ea866880c84"),
  mk("Cheese Vada Pav", 60, "Street", true, "Kitchen"),
  mk("Misal Pav", 90, "Street", true, "Kitchen", "photo-1626132647523-66f5bf380027"),
  mk("Pav Bhaji", 120, "Street", true, "Grill"),
  mk("Bombay Sandwich", 80, "Street", true, "Grill"),
  mk("Chicken Frankie", 110, "Rolls", false, "Grill", "photo-1626700051175-6818013e1d4f"),
  mk("Paneer Frankie", 100, "Rolls", true, "Grill"),
  mk("Egg Bhurji Roll", 90, "Rolls", false, "Grill", undefined, { stock: 6 }),
  mk("Cheese Maggi", 90, "Bowls", true, "Kitchen"),
  mk("Butter Chicken Rice", 160, "Bowls", false, "Kitchen"),
  mk("Masala Chai", 25, "Drinks", true, "Bar", "photo-1561336313-0bd5e0b27ec8"),
  mk("Cold Coffee", 80, "Drinks", true, "Bar"),
  mk("Kokum Sherbet", 50, "Drinks", true, "Bar"),
  mk("Mango Lassi", 70, "Drinks", true, "Bar", undefined, { out: true }),
];

const now = Date.now();
const min = 60e3;
function tables(spec: [Table["zone"], number][]): Table[] {
  const statuses: TableStatus[] = ["seated", "ordered", "free", "bill", "ordered", "cleaning", "free", "seated", "ordered", "free"];
  let n = 0;
  return spec.flatMap(([zone, count]) =>
    Array.from({ length: count }, (_, i) => {
      n++;
      return { id: `T${n}`, n, zone, seats: [2, 4, 4, 6, 2][i % 5]!, status: statuses[(n - 1) % 10]!, since: now - ((n * 7) % 55) * min - 3 * min, x: 8 + (i % 3) * 30, y: 12 + Math.floor(i / 3) * 44, round: zone === "Bar" };
    }),
  );
}

function hourly(base: number, open: number, close: number) {
  return Array.from({ length: close - open }, (_, i) => {
    const h = open + i;
    const peak = Math.exp(-((i - (close - open) * 0.65) ** 2) / 8);
    const today = Math.round(base * (0.25 + peak) * (0.9 + ((h * 13) % 7) / 30));
    return { h: `${h % 24}:00`, today, lastWeek: Math.round(today * (0.82 + ((h * 7) % 5) / 20)) };
  });
}

const leaks = (sym: number, names: string[]): Leak[] => [
  { id: "L1", staff: names[0]!, kind: "Void after payment", amount: 1240 * sym, minsAgo: 38, order: "#1042", timeline: [["10:02 pm", "Order opened, 4 items"], ["10:31 pm", "Paid by cash"], ["10:34 pm", "2 items voided — reason: 'mistake'"], ["10:34 pm", "Drawer opened, no sale"]] },
  { id: "L2", staff: names[1]!, kind: "Discount over threshold", amount: 860 * sym, minsAgo: 71, order: "#1031", timeline: [["9:12 pm", "Order opened"], ["9:40 pm", "35% discount applied — reason: 'regular'"], ["9:41 pm", "Paid by UPI"]] },
  { id: "L3", staff: names[2]!, kind: "Cash mismatch", amount: 500 * sym, minsAgo: 120, order: "Shift close", timeline: [["8:00 pm", "Shift cash expected"], ["8:05 pm", "Counted short"]] },
  { id: "L4", staff: names[0]!, kind: "Comp", amount: 690 * sym, minsAgo: 150, order: "#1018", timeline: [["7:30 pm", "Item comped — no manager approval"]] },
  { id: "L5", staff: names[3]!, kind: "No-sale drawer", amount: 0, minsAgo: 22, order: "—", timeline: [["10:40 pm", "Drawer opened"], ["10:52 pm", "Drawer opened"], ["11:01 pm", "Drawer opened"]] },
];

const staff = (names: string[], base: number): Staff[] =>
  names.map((name, i) => ({ id: `s${i}`, name, role: ["Bartender", "Server", "Cashier", "Server", "Manager"][i]!, sales: Math.round(base * (1.4 - i * 0.18)), risk: [78, 54, 41, 22, 8][i]! }));

const daily = (base: number) => Array.from({ length: 14 }, (_, i) => Math.round(base * (0.8 + ((i * 37) % 11) / 20 + (i % 7 >= 4 ? 0.35 : 0))));

const mumNames = ["Arjun", "Meera", "Kabir", "Sana", "Rohan"];
const dxbNames = ["Omar", "Layla", "Ravi", "Fatima", "Daniel"];
const puneNames = ["Sahil", "Pooja", "Aditya", "Neha", "Vikram"];

export const venues: Venue[] = [
  {
    id: "mumbai", name: "Volt Room", city: "Mumbai", type: "Bar", currency: "INR", symbol: "₹",
    tax: { label: "GST", rate: 0.05, split: true, serviceCharge: 0, inclusive: false },
    categories: barCats, menu: barMenu, tables: tables([["Bar", 4], ["Main", 6]]),
    staff: staff(mumNames, 42000), leaks: leaks(1, mumNames), hourly: hourly(9000, 17, 25), daily: daily(84000),
  },
  {
    id: "dubai", name: "Saffron Courtyard", city: "Dubai", type: "Dine-in", currency: "AED", symbol: "AED",
    tax: { label: "VAT", rate: 0.05, split: false, serviceCharge: 0.1, inclusive: false },
    categories: ["Mezze", "Grill", "Mains", "Desserts", "Drinks"], menu: dubaiMenu, tables: tables([["Patio", 4], ["Main", 6]]),
    staff: staff(dxbNames, 2600), leaks: leaks(0.045, dxbNames), hourly: hourly(600, 12, 24), daily: daily(5200),
  },
  {
    id: "pune", name: "Sprint Truck", city: "Pune", type: "Food truck", currency: "INR", symbol: "₹",
    tax: { label: "GST", rate: 0.05, split: true, serviceCharge: 0, inclusive: true },
    categories: ["Street", "Rolls", "Bowls", "Drinks"], menu: puneMenu, tables: [],
    staff: staff(puneNames, 9000), leaks: leaks(0.15, puneNames), hourly: hourly(2200, 11, 23), daily: daily(18000),
  },
];

export const topItems = (v: Venue) =>
  v.menu.filter((m) => !m.out).map((m, i) => ({ name: m.name, qty: Math.round(80 / (1 + i * 0.35)) + ((i * 7) % 5), revenue: 0, price: m.price }))
    .map((x) => ({ ...x, revenue: x.qty * x.price })).sort((a, b) => b.revenue - a.revenue);

export const ALLERGENS = ["Nuts", "Gluten", "Dairy", "Shellfish"];
