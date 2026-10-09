# TabSprint POS

ROLE
You are a principal product designer with 40+ years of UI/UX experience (hardware POS interfaces through modern SaaS) and a senior full-stack engineer. Build "TabSprint", a premium cloud POS for fast-paced bars, dine-in restaurants and food trucks. Every pixel must feel intentional, calm under pressure, and expensive. Design principle: "Speed is the luxury. Depth, not decoration."

PRODUCT ONE-LINER
TabSprint: "The POS that keeps up with your rush." Perfect for fast-paced bars, dine-ins, and food trucks.

TARGET USERS
1. Bartender/cashier: one-handed, loud, dark room, 3-tap order entry
2. Food truck operator: direct sunlight, spotty internet, phone or small tablet
3. Dine-in server/manager: tables, courses, split checks
4. Owner: checks sales from their phone at 11pm
5. Guest: scans a QR, orders, opens a tab, pays

STACK
React + Vite + TypeScript, Tailwind CSS, shadcn/ui (customised heavily, never default look), Framer Motion, Recharts, Lucide icons, Zustand, TanStack Query, Supabase (auth, Postgres, realtime, row-level security). Payments abstraction layer with Razorpay (India) and Stripe (global) adapters, mocked in demo mode. PWA with service worker and IndexedDB queue for offline orders.

BUILD PHASES (build in order, tell me when each is done)
PHASE 1 (fully working): marketing site, auth and onboarding, menu manager, POS order screen with bar tabs, tables, KDS, payments with tips and split, QR guest ordering, owner dashboard, offline mode, staff roles with audit log and leakage alerts, GST/VAT tax engine.
PHASE 2 (working UI with seeded demo data): inventory and recipe costing, online ordering storefront, delivery aggregator hub (Zomato, Swiggy, UberEats, DoorDash, Deliveroo, Talabat as connection cards with mock order feed), reservations and waitlist with live floor plan, gift cards, tiered loyalty, email/SMS/WhatsApp campaigns, customer CRM and feedback, employee scheduling and clock-in.
PHASE 3 (polished "Coming soon" cards with waitlist button): payroll sync, accounting export (Tally, QuickBooks, Xero), multi-brand loyalty network, kiosk mode, guest WiFi capture, AI insights (demand forecast, menu optimisation), capital/financing, public API and developer portal.

DESIGN SYSTEM (strict, use CSS variables and Tailwind tokens)

Colour, dark mode is the default ("Night Shift"):
- ink-950 #07090D (app background)
- ink-900 #0C1017 (panels)
- ink-800 #131923 (cards)
- ink-700 #1B2330 (raised cards, inputs)
- ink-600 #263042 (borders, dividers)
- text-primary #F4F6F8, text-secondary #A3ADBB, text-muted #6B7686
- Brand "Volt" #C6FF3D (primary accent, used ONLY for primary actions, active states and key numbers; ink text on top of it)
- Volt-deep #9BD11A (pressed), Volt-glow rgba(198,255,61,0.16) (focus halos)
- Ember #FF7A45 (secondary accent: promos, happy hour, alerts needing attention)
- Semantic: success #34D399, warning #FBBF24, danger #F87171, info #60A5FA
- Light mode ("Daylight", built for food trucks in sunlight): bg #F6F4EE, cards #FFFFFF, borders #E4E0D6, text #10151C, primary button stays Volt with ink text, accent text on light uses #5F8A00. Contrast must pass WCAG AA everywhere, AAA for prices and totals.
- Rule: 60% ink, 30% neutral surfaces, 10% Volt. Never put Volt text on a light background.

Typography:
- Display/headings: Sora (600/700), tight tracking -0.02em
- UI/body: Inter (400/500/600)
- Numbers, prices, timers: JetBrains Mono or Inter with tabular-nums, always right-aligned in columns
- Scale (px): 12, 14, 16, 18, 22, 28, 36, 48, 64 (hero only). POS screens never go below 14px, and tap labels are 16px minimum.
- Currency symbol is lighter weight and 80% size than the amount.

Spacing and shape:
- 4px base grid. Touch targets 48px minimum on POS, 56px for primary actions, 44px elsewhere
- Radius: 8 (inputs), 12 (buttons, chips), 16 (cards), 24 (modals/sheets), full (pills)
- Borders 1px ink-600 at 60% opacity, with a 1px top inner highlight (rgba(255,255,255,0.05)) on raised cards for a "machined" look

Depth (3D feel without cost):
- Elevation 1: 0 1px 0 rgba(255,255,255,.04) inset, 0 1px 2px rgba(0,0,0,.4)
- Elevation 2: plus 0 8px 24px -8px rgba(0,0,0,.55)
- Elevation 3 (modals): plus 0 24px 64px -16px rgba(0,0,0,.7)
- Primary button: Volt gradient (top #D4FF63 to bottom #B5F02A), 1px inner top highlight, 3px darker bottom edge (#8DBB14) that compresses to 1px on press with translateY(2px). Secondary buttons: ink-700 with the same tactile edge.
- Glass (backdrop-blur 16px, ink-900 at 70%) only on: marketing nav, dashboard hero, QR menu header. NEVER on the POS order screen.
- One ambient glow: a soft Volt radial gradient (opacity .08) behind hero numbers and the marketing hero.

Motion (Framer Motion, transform and opacity only):
- Durations: 120ms taps, 200ms transitions, 320ms sheets/modals, easing cubic-bezier(.2,.8,.2,1)
- Items "fly" to the cart with a 220ms arc, the cart total counts up, success shows a Volt checkmark that draws itself (SVG stroke) with a 1.04 bounce, KDS tickets slide in from the right with a 40ms stagger, tab chips pulse once when a new round is added
- Skeleton shimmers for loading, optimistic UI everywhere
- Respect prefers-reduced-motion. Add a "Performance mode" toggle (Settings) that removes glass, glows and non-essential animation for cheap Android devices.

Iconography and imagery:
- Lucide at 1.75 stroke, 20/24px. Menu item photos in 4:3, rounded 12, with a subtle dark gradient overlay for text legibility. When there is no photo, show a coloured monogram tile, never a broken image.

Micro-details to include:
- Keyboard shortcuts on desktop (N new order, T tabs, K kitchen, / search), long-press for quick modifiers, haptic feedback via navigator.vibrate on confirm and error, sound toggle for new KDS orders, empty states with illustration and one clear action, inline validation, undo toast (5s) on every destructive action, consistent 8px focus ring in Volt-glow, tooltips only on desktop, safe-area insets on mobile, 100dvh layouts.

MARKETING SITE (premium, conversion-focused, single page plus pricing)
Sticky glass nav: logo (a bold "T" glyph with a lightning-slash cut, Volt) + TabSprint wordmark, links (Product, Industries, Pricing, Demo), "Start free" primary button, theme toggle.
1. Hero: headline "Run the rush. Not the register." Subhead "TabSprint is the POS built for fast-paced bars, dine-ins, and food trucks. Open a tab in one tap, split in two, close the night with zero leakage." CTAs: "Start free trial" and "Watch 60-sec demo". Right side: a tilted 3D-style device mockup (CSS perspective transform) showing the live POS screen, with floating glass chips ("Tab #14 · ₹2,480", "KOT sent", "Offline synced"). Trust strip below: "No hardware lock-in · Works offline · GST/VAT ready".
2. Industry tabs ("Bars", "Dine-in", "Food trucks"): each switches the mockup and 3 bullet benefits (bars: tabs, pre-auth, happy hour, ID check; dine-in: tables, courses, reservations; food trucks: offline, one-hand mode, daylight theme, queue numbers).
3. Feature bento grid (asymmetric, 12-col): Open tabs · Split and tip · Kitchen display · QR ordering · Delivery hub · Inventory and recipe cost · Leakage alerts · Reservations · Loyalty and gift cards · Owner app. Each tile has a mini live animation.
4. "Rush hour" interactive demo: a button that simulates 20 orders flowing POS to KDS to dashboard.
5. Differentiator section: "Leakage Alerts" with a dashboard mock showing voids, discounts and cash mismatches by staff.
6. Offline section: animated network icon toggling, "Keep selling when the Wi-Fi dies".
7. Global section: multi-currency, GST/VAT, languages (English, Hindi, Arabic with RTL support) shown as a switcher.
8. Pricing (3 plans, monthly/annual toggle with "2 months free"): Sprint (single outlet, core POS), Rush (adds inventory, delivery hub, reservations, loyalty), Chain (multi-outlet, API, priority support). Use realistic placeholder prices and make them easy to edit in one config file.
9. Testimonials (3 placeholder cards), FAQ accordion, final CTA band, footer.
Use scroll-triggered reveals (once only, 24px rise + fade), no parallax.

APP SCREENS (Phase 1 detail)

A. Onboarding: 4 steps (business type: Bar / Dine-in / Food truck, country and currency and tax, import menu via CSV or "load sample menu", invite staff). Progress bar with Volt fill. Pre-configures defaults per type.

B. POS Order Screen (the hero, fastest and calmest, no glass):
- Layout (tablet landscape): left 62% item grid with category rail, right 38% cart. Phone: bottom-sheet cart with sticky total bar.
- Search bar with instant fuzzy results, "Favourites" and "Recent" rows at the top
- Item tile: photo or monogram, name, price (tabular), veg/non-veg dot, stock badge, "86'd" overlay if unavailable
- Modifiers sheet: size, add-ons, spice, notes, with live price delta
- Order types: Bar Tab, Dine-in (table picker), Takeaway, Food-truck Queue (auto ticket number), Delivery
- BAR TABS: open tab with name or card pre-auth (mock), add rounds, "Transfer tab", "Merge tabs", tab chips along the top showing running totals and age, ID-check reminder flag, happy-hour auto-pricing banner in Ember with countdown
- Courses and fire: Hold, Fire now, Course 1/2/3 for dine-in
- Discounts (% or amount, reason mandatory, permission-gated), comps, voids with reason
- Checkout sheet: Cash (change calculator with quick-notes), UPI with dynamic QR, Card, Wallets (Apple Pay/Google Pay buttons mocked), Gift card, Loyalty points. Tip step with 10/15/20% presets, custom, and "no tip". Split: equal, by item (drag items to guests), by seat, or by custom amount, with a live "remaining" indicator. Multiple tenders per bill.
- Success: animated check, receipt preview, send via WhatsApp/SMS/email/print (ESC/POS formatted), "New order" auto-focus

C. Tables and Floor: drag-and-drop editable floor plan (zones: Bar, Patio, Main), status colours (free, seated, ordered, bill requested, needs cleaning), timer per table, merge/split tables, tap to open order.

D. Kitchen/Bar Display: columns New / Preparing / Ready, station routing (Kitchen, Bar, Grill), ticket cards with elapsed timer turning amber at 8 min and red at 12 min, allergy flags in bold red, course grouping, bump gesture, recall, sound alerts, large type readable from 2 metres.

E. Guest QR ordering (mobile, the "wow" screen): glass header with venue name, sticky category chips, rich food cards, search, dietary filters, modifiers, "Open a tab" with name, "Add to tab", "Call waiter", live order tracker (Received, Preparing, Ready), pay now (UPI/card/wallet) with tip, split with friends via shareable link, feedback prompt after payment (1-5 stars plus comment).

F. Owner Dashboard (phone-first): glass hero card with tilted 3D count-up "Today's sales", live vs same day last week delta, orders, average check, tips, payment-mode donut, hourly sales area chart, top and bottom items, table turn time, staff leaderboard. Outlet switcher (multi-outlet). Day-end close wizard: expected vs actual cash, variance highlighted, Z-report export (PDF/CSV).
- LEAKAGE ALERTS panel (signature feature): flags voids after payment, deleted bills, discounts over threshold, comps, repeated no-sale drawer opens, cash mismatch, with staff name, time, amount and an "Investigate" drawer showing the order timeline. Risk score per staff.

G. Settings: roles (Owner, Manager, Cashier, Bartender, Server, Kitchen) with a permission matrix, audit log with filters, taxes (GST slabs, VAT, service charge, inclusive/exclusive), currencies, printers, devices, languages, theme, Performance mode, offline test toggle.

OFFLINE (first-class)
Persistent indicator (green dot Online / amber dot "Offline, 3 orders queued"). All POS, KDS and payments (cash and recorded card/UPI) keep working from IndexedDB; sync on reconnect with conflict-safe order IDs and a "3 orders synced" toast. Include a demo switch to simulate offline.

PHASE 2 SCREENS (working UI, seeded data)
- Inventory: ingredient list, stock levels with low-stock chips, recipe builder linking menu items to ingredients, food-cost % per dish, wastage log, purchase orders, supplier list, variance report.
- Online ordering storefront: branded public page per venue (/order/:slug) with delivery or pickup, slot picker, commission-free badge, live order flow into POS.
- Delivery hub: connection cards for each aggregator, unified order feed with accept/reject, auto-print KOT, menu sync status, payout reconciliation table (expected vs received, flagged differences).
- Reservations and waitlist: calendar and timeline, party size, deposits (mock), walk-in waitlist with SMS "table ready", live floor-plan overlay.
- Gift cards: sell physical/e-gift, balance lookup, redeem at checkout.
- Loyalty: points rules, tiers (Silver, Gold, Black), birthday rewards, wallet pass preview.
- Marketing and CRM: customer profiles (visits, spend, favourites, birthday), segments, campaign builder (WhatsApp/SMS/email) with preview, feedback inbox and review links.
- Staff: weekly shift scheduler (drag and drop), clock in/out with PIN, labour cost % vs sales.
- Multi-outlet HQ view and multi-currency reporting.

DATA MODEL (Supabase, with RLS by organisation_id)
organisations, outlets, users, roles, menu_categories, menu_items, modifiers, tables, orders, order_items, tabs, payments, tips, discounts, voids, audit_logs, shifts, cash_sessions, customers, loyalty_accounts, gift_cards, inventory_items, recipes, purchase_orders, reservations, aggregator_connections, campaigns, feedback.

SEED DATA
Three demo venues the user can switch between: a Mumbai cocktail bar (INR, GST), a Dubai dine-in (AED, 5% VAT), and a Pune food truck (INR). Each with 30-40 menu items, Unsplash photos, 10 tables where relevant, 5 staff, 14 days of sales history, pre-seeded leakage events, and a "Simulate rush hour" button.

QUALITY BAR
- Lighthouse performance 90+, smooth at 60fps on a low-end Android tablet, bundle-split by route, lazy images with fixed aspect ratios
- Accessible: semantic HTML, labels, visible focus, full keyboard use, colour never the only signal
- Responsive from 360px to 1920px, RTL ready
- Clean folders: components/ui, features/, screens/, store/, lib/, hooks/, data/
- Reusable components: Button, Card, Chip, Sheet, Modal, Toast, Stat, Ticket, TableTile, ItemTile
- Copy: short, confident, no jargon, sentence case

DELIVERABLE
Start by showing the design tokens (tailwind.config + CSS variables), the component library preview page (/styleguide), and the folder structure. Then build Phase 1 screen by screen: marketing site, onboarding, POS, tables, KDS, QR menu, owner dashboard, settings. Run it, fix errors, and tell me how to open each screen. Wait for my "Continue to Phase 2" before moving on.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/707e2d0c-ac94-41aa-8ba5-ba390663014a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
