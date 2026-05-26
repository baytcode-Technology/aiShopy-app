# Theming & UI (aiShopy)

## Colors

Edit **`src/theme/palette.ts`** (+ sync **`palette.cjs`**). Monochrome palette: ink, charcoal, grays, white.

Tailwind: `bg-brand-primary`, `text-ink`, `bg-gray-100`, `bg-ink-overlay`, etc.

## NativeWind

Use **`className`** on layout and text. Reusable pieces live in **`@/components/ui`**.

## Pressables

Never put `shadow-*`, `opacity-*`, or conditional `className` on **`Pressable`**. Use **`Button`**, **`AppPressable`**, or an inner **`View`** with classes.

## Motion

Use **`AnimatedFadeIn`** (`react-native-reanimated`) for subtle entrance animations — Framer Motion is web-only.

## Screens

- **`Screen`** — gray shell background  
- **`ScreenHeader`** — white header bar + title  
- **`SearchBar`** / **`SearchField`** (alias), **`EmptyState`**, **`MenuRow`**, **`Chip`**, **`Fab`**, **`SectionHeader`**, **`Skeleton`**, **`PressableScale`**, **`StickyBottomBar`**

Chat UI is intentionally unchanged.
