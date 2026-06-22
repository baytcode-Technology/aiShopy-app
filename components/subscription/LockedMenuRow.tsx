import { MenuRow } from '@/components/ui/MenuRow'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Colors from '@src/theme/colors'
import type { ComponentProps } from 'react'
import { Pressable, View } from 'react-native'

type MenuRowProps = ComponentProps<typeof MenuRow>

type Props = MenuRowProps & {
  locked: boolean
  onLockedPress: () => void
}

export function LockedMenuRow({
  locked,
  onLockedPress,
  onPress,
  ...menuRowProps
}: Props) {
  if (!locked) {
    return <MenuRow {...menuRowProps} onPress={onPress} />
  }

  return (
    <Pressable onPress={onLockedPress} accessibilityRole="button">
      <View className="relative opacity-45">
        <MenuRow {...menuRowProps} onPress={undefined} showChevron={false} />
        <View pointerEvents="none" className="absolute top-3 right-3">
          <View className="w-8 h-8 rounded-full bg-surface border border-gray-200 items-center justify-center">
            <FontAwesome5
              name="crown"
              size={12}
              color={Colors.brand.primary}
              solid
            />
          </View>
        </View>
      </View>
    </Pressable>
  )
}
