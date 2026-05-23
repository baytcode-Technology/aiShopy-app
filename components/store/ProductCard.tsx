import { Image, Pressable, Text, View } from 'react-native'
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
      <View className="h-28 rounded-[10px] bg-gray-100 items-center justify-center mb-2.5 overflow-hidden">
        {product.thumbnail_url ? (
          <Image
            source={{ uri: product.thumbnail_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-[26px] font-extrabold text-gray-400 tracking-wide">
            {initials(product.name)}
          </Text>
        )}
      </View>
      <Text className="text-sm font-bold text-ink mb-2 min-h-9 leading-[18px]" numberOfLines={2}>
        {product.name}
      </Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-extrabold text-ink tracking-tight">
          {symbol}
          {product.base_price}
        </Text>
        <Caption className={cn(lowStock && 'text-warning')}>Stock: {product.stock_qty}</Caption>
      </View>
    </>
  )

  if (onPress) {
    return (
      <PressableCard className="flex-1 m-1.5" onPress={onPress}>
        {content}
      </PressableCard>
    )
  }

  return <Card className="flex-1 m-1.5">{content}</Card>
}
