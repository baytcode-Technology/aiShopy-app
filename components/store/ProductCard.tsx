import { Image, Text, View } from 'react-native'
import { PressableCard } from '@/components/ui/Card'
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
    <PressableCard
      className="w-full p-0 overflow-hidden rounded-3xl border border-gray-100"
      padded={false}
      onPress={onPress}
    >
      <View className="w-full">
        <View className="aspect-[0.88] bg-gray-100 items-center justify-center overflow-hidden">
          {product.thumbnail_url ? (
            <Image
              source={{ uri: product.thumbnail_url }}
              className="w-[88%] h-[78%]"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-3xl font-extrabold text-gray-300 tracking-wider">
              {initials(product.name)}
            </Text>
          )}
        </View>
        <View className="px-3 pb-3 pt-2 items-center">
          <View className="bg-white rounded-full px-4 py-2.5 items-center w-full border border-gray-100">
            <Text className="text-[14px] font-extrabold text-ink tracking-tight" numberOfLines={1}>
              {product.name}
            </Text>
            <Text className="text-[13px] font-semibold text-gray-600 mt-0.5">
              {symbol}
              {product.base_price}
            </Text>
          </View>
        </View>
      </View>
    </PressableCard>
  )
}
