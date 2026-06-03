import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Text, View } from 'react-native'
import { PressableScale } from '@/components/ui/PressableScale'
import Colors from '@src/theme/colors'

type Props = {
  title?: string
  subtitle?: string
  onPress: () => void
}

/** Full-width “add” tile for empty category grids. */
export function AddGridTile({
  title = 'Add products',
  subtitle = 'Assign from your catalog or create a new product.',
  onPress,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      className="w-full rounded-[26px] border-2 border-dashed border-gray-300 bg-surface overflow-hidden"
    >
      <View className="flex-row items-center gap-4 px-5 py-6">
        <View className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center">
          <FontAwesome name="plus" size={22} color={Colors.brand.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold text-ink tracking-tight">{title}</Text>
          <Text className="text-[13px] text-gray-500 font-medium mt-1 leading-5">{subtitle}</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color={Colors.text.muted} />
      </View>
    </PressableScale>
  )
}
