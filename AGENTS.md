<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules

- Design tokens live only in src/styles.css (Tailwind v4 CSS-first, no tailwind.config) — single source for theming.
- Branded primitives live in src/components/ts/; shadcn ui stays in src/components/ui — keeps custom look separate from base library.
- POS client state uses Zustand stores in src/store/ — fast, synchronous updates for order entry.
- Editable plan prices live in src/config/pricing.ts — one place to change pricing.
- Client state persists to IndexedDB via src/lib/persist.ts; orders go through the outbox store with device-scoped ids — offline-first with idempotent replay.
