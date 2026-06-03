import { Image, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { PressableScale } from '@/components/ui/PressableScale'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

export type ProductListStatus = 'active' | 'draft' | 'archived'

export function resolveProductStatus(product: Product): ProductListStatus {
  const status = (product.metadata as { status?: string } | undefined)?.status
  if (status === 'archived') return 'archived'
  if (!product.is_active) return 'draft'
  return 'active'
}

function variantCount(product: Product): number | null {
  const n = (product.metadata as { variant_count?: number } | undefined)?.variant_count
  return typeof n === 'number' && n > 0 ? n : null
}

const STATUS_BADGE: Record<
  ProductListStatus,
  { label: string; wrap: string; text: string }
> = {
  active: {
    label: 'Active',
    wrap: 'bg-[#DCFCE7]',
    text: 'text-[#166534]',
  },
  draft: {
    label: 'Draft',
    wrap: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
  },
  archived: {
    label: 'Archived',
    wrap: 'bg-gray-100',
    text: 'text-gray-600',
  },
}

type Props = {
  product: Product
  onPress?: () => void
}

export function ProductListRow({ product, onPress }: Props) {
  const status = resolveProductStatus(product)
  const badge = STATUS_BADGE[status]
  const variants = variantCount(product)
  const available = product.track_inventory ? product.stock_qty : null

  const inventoryLabel =
    available === null
      ? null
      : available === 1
        ? '1 available'
        : `${available} available`

  const inventoryTone =
    available !== null && available <= 0 ? 'text-[#991B1B]' : 'text-gray-500'

  return (
    <PressableScale onPress={onPress} disabled={!onPress}>
      <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-200">
        <View
          className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center"
        >
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
          {inventoryLabel ? (
            <Text className={`text-[13px] mt-0.5 ${inventoryTone}`}>
              {inventoryLabel}
              {variants != null ? (
                <Text className="text-gray-500">{` · ${variants} variants`}</Text>
              ) : null}
            </Text>
          ) : variants != null ? (
            <Text className="text-[13px] text-gray-500 mt-0.5">{`${variants} variants`}</Text>
          ) : null}
        </View>

        <View className={`px-2.5 py-1 rounded-full ${badge.wrap}`}>
          <Text className={`text-[12px] font-semibold ${badge.text}`}>{badge.label}</Text>
        </View>
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
