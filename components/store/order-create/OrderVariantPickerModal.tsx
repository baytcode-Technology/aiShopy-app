import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { SleekModal } from '@/components/ui/Modal'
import { getVariantStockLabel, stockLabelToneClass } from '@src/lib/product-inventory'
import { formatMoney } from '@src/lib/format-money'
import Colors from '@src/theme/colors'
import type { Product, ProductVariant } from '@src/types/product'
import { unitPrice } from './types'

type Props = {
  visible: boolean
  product: Product | null
  variants: ProductVariant[]
  loading?: boolean
  currency?: string
  onClose: () => void
  onSelectVariant: (variant: ProductVariant) => void
}

export function OrderVariantPickerModal({
  visible,
  product,
  variants,
  loading,
  currency,
  onClose,
  onSelectVariant,
}: Props) {
  return (
    <SleekModal
      isOpen={visible}
      onClose={onClose}
      title={product?.name ?? 'Choose variant'}
      subtitle="Select a variant to add"
      minHeightRatio={0.5}
      maxHeightRatio={0.8}
    >
      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : (
        <View>
          {variants.map((variant) => {
            const price = product ? unitPrice(product, variant) : 0
            const stockLabel = product ? getVariantStockLabel(product, variant) : null
            return (
              <Pressable
                key={variant.id}
                className="flex-row items-center gap-3 py-3.5 border-b border-gray-100 active:opacity-80"
                onPress={() => onSelectVariant(variant)}
              >
                <View className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
                  {variant.image_url ? (
                    <Image
                      source={{ uri: variant.image_url }}
                      style={styles.thumb}
                      resizeMode="cover"
                    />
                  ) : product?.thumbnail_url ? (
                    <Image
                      source={{ uri: product.thumbnail_url }}
                      style={styles.thumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <FontAwesome name="image" size={18} color={Colors.text.muted} />
                  )}
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-[15px] font-semibold text-ink" numberOfLines={2}>
                    {variant.name}
                  </Text>
                  <Text className="text-[13px] text-gray-500 mt-0.5">
                    {formatMoney(price, currency)}
                    {stockLabel ? (
                      <Text className={stockLabelToneClass(stockLabel.tone)}>
                        {` · ${stockLabel.text}`}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </Pressable>
            )
          })}
          {variants.length === 0 ? (
            <Text className="text-center text-gray-500 py-8">No active variants</Text>
          ) : null}
        </View>
      )}
    </SleekModal>
  )
}

const styles = StyleSheet.create({
  thumb: { width: 48, height: 48 },
})
