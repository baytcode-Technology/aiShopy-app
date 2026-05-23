# Theming (aiShopy)

## Change colors app-wide

1. Edit **`src/theme/palette.cjs`** — raw hex values (ink, surface, grays, success, danger, etc.).
2. Tailwind classes (`text-ink`, `bg-surface`, `border-gray-200`, …) pick up automatically via `tailwind.config.js`.
3. Semantic tokens in **`src/theme/colors.ts`** (`Colors.text.primary`, `Colors.brand.primary`, …) are used for icons, spinners, and navigation `contentStyle` where `className` is not available.

Example: swap black/white for gray/cream by changing `ink` and `surface` in `palette.cjs` only.

## UI components

Use `@/components/ui`:

- `Button`, `Input`, `SleekModal`, `Card`, `Badge`, `IconButton`
- `Heading`, `Subtitle`, `SectionTitle`, `Label`, `Muted`, `Caption`

Prefer Tailwind `className` on layout; use `Colors` only when a prop requires a color string (e.g. `FontAwesome` `color`).

## Legacy

- `theme` export in `colors.ts` is deprecated but kept for any remaining imports.
- `constants/Colors.ts` re-exports the same module.
