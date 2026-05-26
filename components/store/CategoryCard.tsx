import { Image, StyleSheet, Text, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import { cn } from '@src/lib/cn'
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
  productCount?: number
  onPress?: () => void
  selected?: boolean
}

export function CategoryCard({ category, productCount, onPress, selected }: Props) {
  const count = productCount ?? category.product_count ?? 0
  const label = count === 1 ? '1 Product' : `${count} Products`

  return (
    <View className="w-full">
      <AppPressable
        onPress={onPress}
        containerClassName={cn(
          'w-full rounded-[24px] overflow-hidden relative bg-gray-100 border-2',
          selected ? 'border-ink' : 'border-transparent'
        )}
        containerStyle={styles.imageContainer}
      >
        {category.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
              {initials(category.name)}
            </Text>
          </View>
        )}

        <View className="absolute bottom-2.5 right-2.5 bg-black rounded-full px-3 py-1.5 shadow-sm">
          <Text className="text-[12px] font-black text-white">
            {label}
          </Text>
        </View>
      </AppPressable>

      <View className="mt-2 px-1">
        <Text
          className="text-[14px] font-bold text-ink leading-tight"
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    aspectRatio: 0.78,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
})
