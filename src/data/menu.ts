export type MenuItem = {
  id: string;
  name: string;
  price: number;
  cat: string;
  veg: boolean;
  hue: number;
  photo?: string;
  stock?: number;
  out?: boolean;
  station: "Bar" | "Kitchen" | "Grill";
  taxRate?: number | undefined; // overrides venue rate when set
  groups?: string[]; // modifier group ids
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop&auto=format&q=60`;

export const categories = ["Cocktails", "Beer", "Spirits", "Small plates", "Mains", "Desserts"];

export const menu: MenuItem[] = [
  { id: "c1", name: "Kokum Margarita", price: 650, cat: "Cocktails", veg: true, hue: 20, photo: u("photo-1556855810-ac404aa91e85"), station: "Bar" },
  { id: "c2", name: "Smoked Old Fashioned", price: 780, cat: "Cocktails", veg: true, hue: 60, photo: u("photo-1470337458703-46ad1756a187"), station: "Bar" },
  { id: "c3", name: "Basil Gimlet", price: 620, cat: "Cocktails", veg: true, hue: 130, station: "Bar", stock: 4 },
  { id: "c4", name: "Espresso Martini", price: 720, cat: "Cocktails", veg: true, hue: 40, photo: u("photo-1514362545857-3bc16c4c7d1b"), station: "Bar" },
  { id: "c5", name: "Negroni", price: 690, cat: "Cocktails", veg: true, hue: 25, station: "Bar" },
  { id: "c6", name: "Mango Mule", price: 590, cat: "Cocktails", veg: true, hue: 80, station: "Bar", out: true },
  { id: "b1", name: "Bira White Pint", price: 380, cat: "Beer", veg: true, hue: 90, photo: u("photo-1608270586620-248524c67de9"), station: "Bar" },
  { id: "b2", name: "Kingfisher Ultra", price: 340, cat: "Beer", veg: true, hue: 100, station: "Bar" },
  { id: "b3", name: "Craft IPA Tap", price: 450, cat: "Beer", veg: true, hue: 70, station: "Bar" },
  { id: "s1", name: "Amrut Fusion", price: 520, cat: "Spirits", veg: true, hue: 50, station: "Bar" },
  { id: "s2", name: "Tequila Shot", price: 420, cat: "Spirits", veg: true, hue: 110, station: "Bar" },
  { id: "p1", name: "Truffle Fries", price: 340, cat: "Small plates", veg: true, hue: 85, photo: u("photo-1573080496219-bb080dd4f877"), station: "Kitchen" },
  { id: "p2", name: "Chilli Chicken Bao", price: 420, cat: "Small plates", veg: false, hue: 15, photo: u("photo-1563245372-f21724e3856d"), station: "Kitchen" },
  { id: "p3", name: "Paneer Tikka", price: 380, cat: "Small plates", veg: true, hue: 35, photo: u("photo-1567188040759-fb8a883dc6d8"), station: "Grill" },
  { id: "p4", name: "Prawn Koliwada", price: 520, cat: "Small plates", veg: false, hue: 30, station: "Kitchen", stock: 3 },
  { id: "p5", name: "Nachos Grande", price: 360, cat: "Small plates", veg: true, hue: 75, station: "Kitchen" },
  { id: "m1", name: "Smash Burger", price: 560, cat: "Mains", veg: false, hue: 30, photo: u("photo-1568901346375-23c9450c58cd"), station: "Grill" },
  { id: "m2", name: "Butter Chicken Bowl", price: 540, cat: "Mains", veg: false, hue: 40, photo: u("photo-1603894584373-5ac82b2ae398"), station: "Kitchen" },
  { id: "m3", name: "Wild Mushroom Pizza", price: 620, cat: "Mains", veg: true, hue: 55, photo: u("photo-1513104890138-7c749659a591"), station: "Kitchen" },
  { id: "m4", name: "Fish Tacos", price: 490, cat: "Mains", veg: false, hue: 200, station: "Grill" },
  { id: "d1", name: "Molten Chocolate", price: 340, cat: "Desserts", veg: true, hue: 30, photo: u("photo-1606313564200-e75d5e30476c"), station: "Kitchen" },
  { id: "d2", name: "Gulab Jamun Cheesecake", price: 360, cat: "Desserts", veg: true, hue: 350, station: "Kitchen" },
];

export const GST_RATE = 0.05;
