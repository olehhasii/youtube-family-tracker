## Project

Remake of the family-subscription-manager app. Read `.scratch/remake/spec.md` before planning or building anything: it holds the agreed scope, stack, design direction and the ticket list in `.scratch/remake/issues/`.

## Motion

Values chosen in the Board prototype (branch `prototype/board-variants`, variant D). Reuse them; add a new value here only when none fits.

- **Curves:** UI ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; sheets/drawers `cubic-bezier(0.32, 0.72, 0, 1)` at 450ms.
- **Layout springs** (row ↔ detail card, card resize): `{ type: 'spring', duration: 0.5, bounce: 0.12 }`.
- **Island morph:** `{ type: 'spring', duration: 0.45, bounce: 0.2 }`; content swaps cross-fade with 4px blur + scale 0.96, 200ms ease-out.
- **Status pill change:** `{ type: 'spring', duration: 0.4, bounce: 0.25 }` from scale 0.9 + opacity 0.
- **Press feedback:** `active:scale-[0.97]` for wide buttons, `0.92` for round icon buttons, 150ms ease-out.
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
