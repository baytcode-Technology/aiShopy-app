import { Image, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { formatMoney } from '@src/lib/format-money'
import { parseOrderItemSnapshot } from '@src/lib/order-invoice'
import type { OrderItem } from '@src/types/order'
import Colors from '@src/theme/colors'

type Props = {
  items: OrderItem[]
  currency: string
}

function HeaderCell({ label, className }: { label: string; className?: string }) {
  return (
    <Text className={`text-[11px] font-semibold text-gray-400 uppercase ${className ?? ''}`}>
      {label}
    </Text>
  )
}

export function OrderInvoiceItemsTable({ items, currency }: Props) {
  return (
    <View>
      <View className="flex-row items-center pb-2 border-b border-gray-200 gap-2">
        <View className="w-11">
          <HeaderCell label="Item" />
        </View>
        <View className="flex-1 min-w-0">
          <HeaderCell label="Product" />
        </View>
        <View className="w-16">
          <HeaderCell label="Variant" />
        </View>
        <View className="w-8 items-center">
          <HeaderCell label="Qty" />
        </View>
        <View className="w-[72px] items-end">
          <HeaderCell label="Price" />
        </View>
      </View>

      {items.map((item) => {
        const { productName, variantName, thumbnailUrl } = parseOrderItemSnapshot(item)

        return (
          <View
            key={item.id}
            className="flex-row items-center py-2.5 border-b border-gray-100 gap-2"
          >
            <View className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <FontAwesome name="image" size={16} color={Colors.text.muted} />
              )}
            </View>

            <Text className="flex-1 min-w-0 text-[13px] font-semibold text-ink" numberOfLines={2}>
              {productName}
            </Text>

            <Text className="w-16 text-[12px] text-gray-500" numberOfLines={2}>
              {variantName ?? ''}
            </Text>

            <Text className="w-8 text-center text-[13px] font-semibold text-ink">
              {item.quantity}
            </Text>

            <Text className="w-[72px] text-right text-[13px] font-semibold text-ink">
              {formatMoney(item.total_price, currency)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  thumb: {
    width: '100%',
    height: '100%',
  },
})
