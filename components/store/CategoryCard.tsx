import { Image, StyleSheet, Text, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import { cn } from '@src/lib/cn'
import type { Category } from '@src/types/category'

type Props = {
  category: Category
  productCount?: number
  onPress?: () => void
  selected?: boolean
}

export function CategoryCard({ category, productCount, onPress, selected }: Props) {
  const count = productCount ?? category.product_count ?? 0
  const label = count === 1 ? '1 Product' : `${count} Products`

  return (
    <AppPressable
      onPress={onPress}
      containerClassName={cn(
        'w-full rounded-3xl overflow-hidden relative border-2',
        selected ? 'border-ink' : 'border-transparent'
      )}
      containerStyle={styles.card}
    >
      <Image
        source={{ uri: category.image_url }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/10" />
      <View className="absolute bottom-4 left-0 right-0 items-center px-3">
        <View className="bg-white/95 rounded-full px-5 py-2.5 items-center min-w-[72%] border border-white/80">
          <Text className="text-[15px] font-extrabold text-ink tracking-tight" numberOfLines={1}>
            {category.name}
          </Text>
          <Text className="text-[12px] font-medium text-gray-500 mt-0.5">{label}</Text>
        </View>
      </View>
    </AppPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.92,
  },
})
