import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { formatMoney } from '@src/lib/format-money'
import { isMarkedSoldProduct, isMarkedSoldVariant } from '@src/lib/product-inventory'
import Colors from '@src/theme/colors'
import type { CartLine } from './types'
import { stockForLine, unitPrice } from './types'

type Props = {
  line: CartLine
  currency?: string
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function OrderCartLine({ line, currency, onQuantityChange, onRemove }: Props) {
  const price = unitPrice(line.product, line.variant)
  const lineTotal = price * line.quantity
  const stock = stockForLine(line)
  const markedSold = line.variant
    ? isMarkedSoldVariant(line.product, line.variant)
    : isMarkedSoldProduct(line.product)
  const showStockWarning = stock !== null && (stock < line.quantity || markedSold)

  const imageUri =
    line.variant?.image_url ?? line.product.thumbnail_url ?? line.product.images[0] ?? null

  return (
    <View className="border border-gray-200 rounded-2xl overflow-hidden mb-3 bg-surface">
      {showStockWarning ? (
        <View className="flex-row items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
          <FontAwesome name="exclamation-triangle" size={12} color="#B45309" />
          <Text className="text-[12px] text-amber-800 flex-1">
            {markedSold
              ? 'This item is marked as sold (0 in stock).'
              : `This product has ${stock} unit${stock === 1 ? '' : 's'} in stock.`}
          </Text>
        </View>
      ) : null}

      <View className="p-3 gap-3">
        <View className="flex-row items-start gap-3">
          <View className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <FontAwesome name="image" size={20} color={Colors.text.muted} />
            )}
          </View>

          <View className="flex-1 min-w-0 pt-0.5">
            <Text className="text-[15px] font-semibold text-ink" numberOfLines={2}>
              {line.product.name}
            </Text>
            {line.variant ? (
              <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
                {line.variant.name}
              </Text>
            ) : null}
            <Text className="text-[14px] font-semibold text-ink mt-1">
              {formatMoney(price, currency)}
            </Text>
          </View>

          <Pressable onPress={onRemove} hitSlop={10} className="p-1">
            <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center">
              <Text className="text-sm text-gray-500 font-bold">✕</Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-row items-center border border-gray-200 rounded-xl overflow-hidden">
          <Text className="flex-1 px-3 py-2.5 text-[14px] text-gray-500">Quantity</Text>
          <View className="flex-row items-center">
            <Pressable
              className="w-11 h-11 items-center justify-center bg-gray-100 border-l border-gray-200"
              onPress={() => onQuantityChange(Math.max(1, line.quantity - 1))}
            >
              <Text className="text-lg text-ink">−</Text>
            </Pressable>
            <Text className="w-10 text-center text-[15px] font-semibold text-ink">
              {line.quantity}
            </Text>
            <Pressable
              className="w-11 h-11 items-center justify-center bg-gray-100 border-l border-gray-200"
              onPress={() => onQuantityChange(line.quantity + 1)}
            >
              <Text className="text-lg text-ink">+</Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-gray-500">
            {formatMoney(price, currency)} × {line.quantity}
          </Text>
          <Text className="text-[15px] font-bold text-ink">{formatMoney(lineTotal, currency)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  thumb: { width: 56, height: 56 },
})
