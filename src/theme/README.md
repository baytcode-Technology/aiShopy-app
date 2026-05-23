# Theming (aiShopy)

## Change colors app-wide

1. Edit **`src/theme/palette.ts`** (and keep **`palette.cjs`** in sync for Tailwind).
2. Use Tailwind classes: `text-ink`, `bg-surface`, `bg-brand-primary`, `text-brand-on-primary`, etc.
3. Use **`Colors`** from `@src/theme/colors` only for icon colors, `ActivityIndicator`, and navigation `contentStyle`.

## Styling with NativeWind

Prefer **`className`** on `View`, `Text`, `TextInput`, `ScrollView`, `SafeAreaView`.

### Pressable / buttons

Do **not** put `shadow-*`, `opacity-*`, `active:*`, or **conditional** `className` directly on `Pressable` — it can break Expo Router.

Use:

| Component | Pattern |
|-----------|---------|
| `Button` | Inner `View` + `Text` with `className` |
| `AppPressable` | `containerClassName` on inner `View` |
| `IconButton`, `Fab`, `Chip` | Pressable + styled inner `View` |

### Reusable UI

`@/components/ui` — `Button`, `Input`, `Chip`, `Fab`, `Card`, `SleekModal`, typography helpers.
