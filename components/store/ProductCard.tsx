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
    <View className="w-full">
      <AppPressable
        onPress={onPress}
        containerClassName="w-full rounded-[24px] overflow-hidden relative bg-gray-100"
        containerStyle={styles.imageContainer}
      >
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
              {initials(product.name)}
            </Text>
          </View>
        )}

        <View className="absolute bottom-2.5 right-2.5 bg-black rounded-full px-3 py-1.5 shadow-sm">
          <Text className="text-[12px] font-black text-white">
            {symbol}
            {product.base_price}
          </Text>
        </View>
      </AppPressable>

      <View className="mt-2 px-1">
        <Text
          className="text-[14px] font-bold text-ink leading-tight"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text className="text-[12px] font-medium text-gray-400 mt-0.5">
          {product.stock_qty > 0 ? `Stock: ${product.stock_qty}` : 'Out of stock'}
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
  productImage: {
    width: '100%',
    height: '100%',
  },
})
