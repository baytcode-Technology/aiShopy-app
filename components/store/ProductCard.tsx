import { Image, Text, View } from 'react-native'
import { PressableCard, Card } from '@/components/ui/Card'
import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
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
  const lowStock = product.track_inventory && product.stock_qty > 0 && product.stock_qty < 10

  const content = (
    <>
      <View className="h-[120px] rounded-2xl bg-gray-100 items-center justify-center mb-3 overflow-hidden border border-gray-100">
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-2xl font-extrabold text-gray-300 tracking-wider">
            {initials(product.name)}
          </Text>
        )}
      </View>
      <Text className="text-[15px] font-bold text-ink mb-2 min-h-10 leading-5" numberOfLines={2}>
        {product.name}
      </Text>
      <View className="flex-row justify-between items-center pt-1 border-t border-gray-100">
        <Text className="text-[17px] font-extrabold text-ink tracking-tight">
          {symbol}
          {product.base_price}
        </Text>
        <Caption className={cn(lowStock && 'text-gray-700 font-bold')}>
          {product.track_inventory ? `${product.stock_qty} left` : '—'}
        </Caption>
      </View>
    </>
  )

  if (onPress) {
    return (
      <PressableCard className="flex-1 m-1.5 p-3.5" onPress={onPress}>
        {content}
      </PressableCard>
    )
  }

  return <Card className="flex-1 m-1.5 p-3.5">{content}</Card>
}
