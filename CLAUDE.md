## Project

A small personal app that tracks which friends sharing a YouTube Premium Family plan have paid, and for which months. It remakes https://github.com/olehhasii/family-subscription-manager with a richer UI and micro-interactions.

- **Who uses it:** friends open a public **Board** (mostly on phones) to check their status; the **Admin** signs in on the same Board to record Payments and edit Members. There is no separate admin panel.
- **Core idea:** Payments are a ledger of whole months with no amounts. Paid Months, the Due Date and each Member's Status are derived from the ledger, never stored. Use the terms in `GLOSSARY.md`; the rules and their reasons are in `docs/adr/`.
- **Direction:** the old app's look made smoother: near-black neutrals, Inter, one centred card, a black pill "island" at the bottom for status, menu and toasts. Motion is the core of the experience, mobile-first but equally good on desktop. 3D (R3F) is an optional, lazy-loaded accent only.
- **Stack:** Vite + React + TypeScript SPA, Tailwind v4, Motion, Base UI, TanStack Query, Supabase (free tier), deployed on Vercel. UA is the default language, EN second.
- **Code layout:** `src/model/` holds the pure payment rules (test-first); `src/data/` is the only place that talks to Supabase; UI lives in `src/features/` and `src/ui/`.

Read `.scratch/remake/spec.md` before planning or building: it holds the full scope and decisions. Work is tracked as tickets in `.scratch/remake/issues/`; take the lowest-numbered ticket that is unblocked and unresolved.

## Motion

Values chosen in the Board prototype (branch `prototype/board-variants`, variant D). Reuse them; add a new value here only when none fits.

- **Curves:** UI ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; sheets/drawers `cubic-bezier(0.32, 0.72, 0, 1)` at 450ms.
- **Layout springs** (row ↔ detail card, card resize): `{ type: 'spring', duration: 0.5, bounce: 0.12 }`.
- **Island morph:** `{ type: 'spring', duration: 0.45, bounce: 0.2 }`; content swaps cross-fade with 4px blur + scale 0.96, 200ms ease-out.
- **Status pill change:** `{ type: 'spring', duration: 0.4, bounce: 0.25 }` from scale 0.9 + opacity 0.
- **Press feedback:** `active:scale-[0.97]` for wide buttons, `0.92` for round icon buttons, 150ms ease-out. Use the `press` / `press-round` utilities from `src/index.css`; JS presets live in `src/ui/motion.ts`.
- **Page load (the one orchestrated moment):** card from 24px below + blur 8px, 500ms ease-out; rows follow with a 50ms stagger.
- **Toasts** live in the island for 2.6s.
- Pair every animation with its `prefers-reduced-motion` variant (opacity only) and gate hover motion behind `(hover: hover) and (pointer: fine)`.

## Agent skills

### Issue tracker

Issues are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
