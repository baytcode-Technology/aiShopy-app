import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import { palette } from '@src/theme/palette'

type Props = {
  selected: boolean
  onPress: () => void
  children: ReactNode
  /** Corner radius — use 18 for bottom tabs, 8 for filter chips. */
  radius?: number
  /** Background when selected. */
  selectedColor?: string
  style?: ViewStyle
  accessibilityLabel?: string
}

/**
 * Rounded selectable pill. Uses StyleSheet (not conditional NativeWind bg-*)
 * so the highlight stays rounded after tab/filter changes on Android.
 */
export function PillTab({
  selected,
  onPress,
  children,
  radius = 8,
  selectedColor = palette.gray200,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.pill,
          { borderRadius: radius },
          selected && { backgroundColor: selectedColor },
          style,
        ]}
      >
        {children}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
})
