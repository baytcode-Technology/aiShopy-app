import { Image, StyleSheet, Text, View } from 'react-native'
import { PressableScale } from '@/components/ui/PressableScale'
import { shadows } from '@src/lib/shadows'
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
  /** Taller card for category index. */
  variant?: 'default' | 'hero'
}

export function CategoryCard({
  category,
  productCount,
  onPress,
  selected,
  variant = 'default',
}: Props) {
  const count = productCount ?? category.product_count ?? 0
  const label = count === 1 ? '1 item' : `${count} items`

  return (
    <View className="w-full">
      <PressableScale onPress={onPress} disabled={!onPress}>
        <View
          className={cn(
            'w-full rounded-[26px] overflow-hidden bg-gray-100 border',
            selected ? 'border-ink' : 'border-gray-200'
          )}
          style={shadows.card}
        >
          <View
            style={[styles.media, variant === 'hero' ? styles.mediaHero : undefined]}
            className="w-full relative"
          >
            {category.image_url ? (
              <Image
                source={{ uri: category.image_url }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 w-full h-full items-center justify-center bg-gray-100">
                <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
                  {initials(category.name)}
                </Text>
              </View>
            )}

            <View
              pointerEvents="none"
              className="absolute top-0 left-0 right-0 flex-row justify-end p-3"
            >
              <View className="bg-surface rounded-full px-3 py-1.5 border border-gray-200">
                <Text className="text-[11px] font-extrabold text-ink tracking-wide">{label}</Text>
              </View>
            </View>

            <View
              pointerEvents="none"
              className="absolute bottom-0 left-0 right-0 pt-10 pb-4 px-4"
              style={styles.overlay}
            >
              <Text
                className="text-[18px] font-extrabold text-white tracking-tight leading-6"
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </View>
          </View>
        </View>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  media: {
    aspectRatio: 0.88,
  },
  mediaHero: {
    aspectRatio: 0.95,
  },
  overlay: {
    backgroundColor: 'rgba(10,10,11,0.48)',
  },
})
