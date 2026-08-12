import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Pressable } from 'react-native'
import { useAppTheme } from '@src/contexts/theme-context'
import { cn } from '@src/lib/cn'

type Props = {
  className?: string
}

/** Moon/sun chip — same styling as Settings Edit button. */
export function ThemeToggleChip({ className }: Props) {
  const { mode, toggleTheme, colors } = useAppTheme()
  const isDark = mode === 'dark'

  return (
    <Pressable
      onPress={toggleTheme}
      className={cn(
        'flex-row items-center justify-center px-3 py-2 rounded-full border border-gray-200 bg-gray-50',
        className,
      )}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <FontAwesome
        name={isDark ? 'sun-o' : 'moon-o'}
        size={12}
        color={colors.brand.primary}
      />
    </Pressable>
  )
}
