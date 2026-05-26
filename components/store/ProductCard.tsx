import { Image, StyleSheet, Text, View } from 'react-native'
import { AppPressable } from '@/components/ui/AppPressable'
import type { Product } from '@src/types/product'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

type Props = {
  product: Product
  currency?: string
  onPress?: () => void
}

export function ProductCard({ product, currency = 'INR', onPress }: Props) {
  const symbol = currency === 'INR' ? '₹' : '$'

  return (
    <AppPressable
      onPress={onPress}
      containerClassName="w-full rounded-3xl overflow-hidden relative bg-gray-100"
      containerStyle={styles.card}
    >
      <View style={styles.imageWrap} className="items-center justify-center">
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
            {initials(product.name)}
          </Text>
        )}
      </View>

      <View className="absolute bottom-4 left-0 right-0 items-center px-3">
        <View className="bg-white/95 rounded-full px-5 py-2.5 items-center min-w-[78%] border border-white/80">
          <Text
            className="text-[15px] font-extrabold text-ink tracking-tight text-center"
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text className="text-[13px] font-semibold text-gray-600 mt-0.5">
            {symbol}
            {product.base_price}
          </Text>
        </View>
      </View>
    </AppPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.88,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
    paddingBottom: 56,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
})
