import { Image, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ProductStatusBadge } from '@/components/store/ProductStatusBadge'
import { PressableScale } from '@/components/ui/PressableScale'
import { getProductStockLabel } from '@src/lib/product-inventory'
import { getProductStatus } from '@src/lib/product-status'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

function variantCount(product: Product): number | null {
  const n = (product.metadata as { variant_count?: number } | undefined)?.variant_count
  return typeof n === 'number' && n > 0 ? n : null
}

type Props = {
  product: Product
  onPress?: () => void
}

export function ProductListRow({ product, onPress }: Props) {
  const status = getProductStatus(product)
  const variants = variantCount(product)
  const stockLabel = getProductStockLabel(product)
  const inventoryTone =
    stockLabel?.tone === 'danger'
      ? 'text-[#991B1B]'
      : stockLabel?.tone === 'muted'
        ? 'text-gray-400'
        : 'text-gray-500'

  return (
    <PressableScale onPress={onPress} disabled={!onPress}>
      <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-200">
        <View className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
          {product.thumbnail_url ? (
            <Image
              source={{ uri: product.thumbnail_url }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <FontAwesome name="image" size={18} color={Colors.text.muted} />
          )}
        </View>

        <View className="flex-1 min-w-0 pr-2">
          <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
            {product.name}
          </Text>
          {stockLabel ? (
            <Text className={`text-[13px] mt-0.5 ${inventoryTone}`}>
              {stockLabel.text}
              {variants != null ? (
                <Text className="text-gray-500">{` · ${variants} variants`}</Text>
              ) : null}
            </Text>
          ) : variants != null ? (
            <Text className="text-[13px] text-gray-500 mt-0.5">{`${variants} variants`}</Text>
          ) : null}
        </View>

        <ProductStatusBadge status={status} />
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
