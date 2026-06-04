import { Image, StyleSheet, Text, View } from 'react-native'
import { CategoryActiveBadge } from '@/components/store/CategoryActiveBadge'
import { PressableScale } from '@/components/ui/PressableScale'
import type { Category } from '@src/types/category'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

type Props = {
  category: Category
  onPress?: () => void
}

export function CategoryListRow({ category, onPress }: Props) {
  const count = category.product_count ?? 0
  const countLabel = count === 1 ? '1 product' : `${count} products`

  return (
    <PressableScale onPress={onPress} disabled={!onPress}>
      <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-200">
        <View className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
          {category.image_url ? (
            <Image
              source={{ uri: category.image_url }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-[13px] font-extrabold text-gray-400">{initials(category.name)}</Text>
          )}
        </View>

        <View className="flex-1 min-w-0 pr-2">
          <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
            {category.name}
          </Text>
          <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
            {countLabel}
          </Text>
        </View>

        <CategoryActiveBadge isActive={category.is_active} />
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  thumb: {
    width: 48,
    height: 48,
  },
})
