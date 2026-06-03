import { Image, StyleSheet, Text, View } from 'react-native'
import { PressableScale } from '@/components/ui/PressableScale'
import { shadows } from '@src/lib/shadows'
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
      <PressableScale onPress={onPress} disabled={!onPress}>
        <View
          className="bg-surface rounded-[26px] border border-gray-200 overflow-hidden"
          style={shadows.card}
        >
          <View style={styles.media} className="w-full bg-gray-100 relative">
            {product.thumbnail_url ? (
              <Image
                source={{ uri: product.thumbnail_url }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 w-full h-full items-center justify-center">
                <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
                  {initials(product.name)}
                </Text>
              </View>
            )}

            <View className="absolute bottom-3 right-3 bg-ink rounded-full px-3.5 py-1.5">
              <Text className="text-[12px] font-extrabold text-brand-on-primary tracking-tight">
                {symbol}
                {product.base_price}
              </Text>
            </View>
          </View>

          <View className="px-3.5 pt-3 pb-3.5">
            <Text
              className="text-[15px] font-bold text-ink leading-snug tracking-tight"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <Text
              className={`text-[12px] font-semibold mt-1.5 ${product.stock_qty > 0 ? 'text-gray-500' : 'text-gray-700'}`}
            >
              {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  media: {
    aspectRatio: 0.82,
  },
})
