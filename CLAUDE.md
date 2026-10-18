## Project

A small personal app that tracks which friends sharing a YouTube Premium Family plan have paid, and for which months. It remakes https://github.com/olehhasii/family-subscription-manager with a richer UI and micro-interactions.

- **Who uses it:** friends open a public **Board** (mostly on phones) to check their status; the **Admin** signs in on the same Board to record Payments and edit Members. There is no separate admin panel.
- **Core idea:** Payments are a ledger of whole months with no amounts. Paid Months, the Due Date and each Member's Status are derived from the ledger, never stored. Use the terms in `GLOSSARY.md`; the rules and their reasons are in `docs/adr/`.
- **Direction:** a calm sky, dark by default with light from the island: an animated ASCII sky as the whole background (a CSS gradient as its fallback), a warm off-white card of Member rows tinted by Status, a "stage" of white headline stats above the card (beside it on desktop), Tektur + Golos Text, and a cream pill "island" at the bottom for status, menu and toasts. Details in the spec's "Look". Motion is the core of the experience, mobile-first but equally good on desktop. The background effect is plain WebGL2 (no three.js), lazy-loaded; the page must look finished without it.
- **Stack:** Vite + React + TypeScript SPA, Tailwind v4, Motion, Base UI, TanStack Query, Supabase (free tier), deployed on Vercel. UA is the default language, EN second.
- **Database:** schema changes are new files in `supabase/migrations/` (never edit an applied one), pushed with `npx supabase db push`. `npm test` is offline; `npm run test:db` runs against the real linked project and needs `.env.local`.
- **Code layout:** `src/model/` holds the pure payment rules (test-first); `src/data/` is the only place that talks to Supabase (UI uses `src/data/hooks/`); UI lives in `src/features/` and `src/shared/`. Tests live in a `__tests__/` folder beside the code they test (e.g. `src/model/__tests__/`), with shared test helpers in the same folder.
  - **Features** (FSD-like): `src/features/<name>/` has its main component at the root (`Island.tsx`, `BoardPage.tsx`) and subfolders as needed: `components/`, `helpers/`, `hooks/`, others. Features import only `shared`, `model`, `data` and `i18n`; `BoardPage` is the one place that composes other features.
  - **Shared:** anything used by more than one feature moves to `src/shared/` (`ui/` components incl. `icons.tsx`, `lib/` non-components, `toast/`).
  - **Files:** one component per file; a tiny one (under ~15 lines, no hooks or state, used by one file) may stay beside its user. Component files are PascalCase, everything else kebab-case; hooks are `use-*.ts`. No barrel `index.ts` files.
  - **Comments:** only a *why* the code can't show (a workaround, a non-obvious constraint, a domain rule), the kind whose removal would invite a bug-introducing "fix". No file headers or comments that restate names or types. The preset docs in `src/shared/lib/motion.ts` stay.

Read `.scratch/remake/spec.md` before planning or building: it holds the full scope and decisions. Work is tracked as tickets in `.scratch/remake/issues/`; take the lowest-numbered ticket that is unblocked and unresolved.

## Motion

Values chosen in the Board prototype (branch `prototype/board-variants`, variant D). Reuse them; add a new value here only when none fits.

- **Curves:** UI ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; sheets/drawers `cubic-bezier(0.32, 0.72, 0, 1)` at 450ms.
- **Layout springs** (row ↔ detail card, card resize): `{ type: 'spring', duration: 0.5, bounce: 0.12 }`.
- **Island morph:** `{ type: 'spring', duration: 0.45, bounce: 0.2 }`; content swaps cross-fade with 4px blur + scale 0.96, 200ms ease-out.
- **Island entrance** (after the original project): rises as an empty 44×30 pill from 160px below (`{ type: 'spring', duration: 0.5, bounce: 0.3 }`, opacity 200ms) at 0.15s into the page reveal, widens into its rest state with the island morph at 0.45s, then its contents pop in from scale 0.1 + blur 20px, 300ms ease-out, from 0.60s, 50ms apart (the last has landed at 1.05s).
- **Rolling letters** (UA ↔ EN, the month count in the record sheet): old label out 10px up, new one in from 10px below, 200ms ease-out.
- **Month strip fill** (record sheet): each cell scales in from the left, 250ms ease-out, 30ms apart; emptying is immediate-start.
- **Status pill change:** `{ type: 'spring', duration: 0.4, bounce: 0.25 }` from scale 0.9 + opacity 0.
- **Press feedback:** `active:scale-[0.97]` for wide buttons, `0.92` for round icon buttons, 150ms ease-out. Use the `press` / `press-round` utilities from `src/index.css`; JS presets live in `src/shared/lib/motion.ts`.
- **Page load (the one orchestrated moment):**
  - *Loader:* the sky's glyphs ` ·:+*oO@`, tinted by density along the palette's ramp, scramble at the centre every 60ms on the empty sky (no curtain). The hand-off is at whichever is later: 1.5s after the data is ready, or the background's first frame (2.5s limit from page start). The last 750ms resolve the glyphs left to right into the Group name (500ms, settled letters turning on-sky white) and hold it 250ms. Without a Group the glyphs fade out in 150ms. Under reduced motion the glyphs stand still, the name appears without decoding, and the 1.5s still holds.
  - *Reveal* (seconds from the hand-off, after the original project's heavier motion): at 0 the sky decodes in outwards from the centre, where the loader's glyphs sat (the effect's intro, 1.1s, glyphs scrambling as they arrive, no scaling; the CSS fallback just fades in over the same time) while the name glides into the stage heading with the layout spring; at 0.15 the island (above); only once it is done, at 1.05, the member count and stats rise from 24px + blur 12px, 450ms ease-out, 70ms apart; at 1.20 the card springs up from 240px below (`{ type: 'spring', duration: 0.6, bounce: 0.2 }`) as blur 10px and opacity clear in 300ms ease-out; at 1.30 the rows follow from 120px + blur 20px, 350ms ease-out, 70ms apart. Each status ring (avatar, island) draws over 800ms, 300ms after what holds it arrives. Under reduced motion the sky and everything else fade in together, opacity only, 300ms.
  - Rows coming back after a detail card closes use the light version: 12px + blur 6px, 450ms, from 150ms, 50ms apart.
  - Never put `initial={false}` on an `AnimatePresence` that holds entering content: it silences every `initial` inside it, rows and rings included.
- **View swaps** (list ↔ detail card): the leaving view fades out in 150ms ease-out; content inside a freshly grown card fades in over 250ms after 150ms.
- **Status colour changes** (ring segments, relative-date text): 250ms `ease`.
- **Theme change:** the whole page cross-fades (View Transitions), 300ms ease-out; instant under reduced motion.
- **Background arriving late** (it missed the page reveal's 2.5s limit): it cross-fades in over the CSS fallback, 600ms ease-out.
- Every value above has a named preset in `src/shared/lib/motion.ts`; use those, not literals.
- **Toasts** live in the island for 2.6s.
- Pair every animation with its `prefers-reduced-motion` variant (opacity only) and gate hover motion behind `(hover: hover) and (pointer: fine)`.

## Agent skills

### Issue tracker

Issues are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
