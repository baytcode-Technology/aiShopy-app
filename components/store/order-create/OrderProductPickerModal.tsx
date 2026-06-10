import { useMemo, useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { SleekModal } from '@/components/ui/Modal'
import { getProductStockLabel, stockLabelToneClass } from '@src/lib/product-inventory'
import { getProductStatus } from '@src/lib/product-status'
import { formatMoney } from '@src/lib/format-money'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'
import { OrderSearchBar } from './OrderSearchBar'

function variantCount(product: Product): number {
  const n = (product.metadata as { variant_count?: number } | undefined)?.variant_count
  return typeof n === 'number' && n > 0 ? n : 0
}

type Props = {
  visible: boolean
  products: Product[]
  loading?: boolean
  currency?: string
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export function OrderProductPickerModal({
  visible,
  products,
  loading,
  currency,
  onClose,
  onSelectProduct,
}: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const active = products.filter((p) => getProductStatus(p) === 'active')
    if (!q) return active
    return active.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, search])

  return (
    <SleekModal
      isOpen={visible}
      onClose={onClose}
      title="Products"
      minHeightRatio={0.5}
      maxHeightRatio={0.8}
    >
      <OrderSearchBar value={search} onChangeText={setSearch} />

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : (
        <View>
          {filtered.map((product) => {
            const variants = variantCount(product)
            const stockLabel = getProductStockLabel(product)
            const status = getProductStatus(product)

            return (
              <Pressable
                key={product.id}
                className="flex-row items-center gap-3 py-3.5 border-b border-gray-100 active:opacity-80"
                onPress={() => onSelectProduct(product)}
              >
                <View className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
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

                <View className="flex-1 min-w-0">
                  <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text className="text-[13px] text-gray-500 mt-0.5">
                    {variants > 0 ? (
                      <>
                        {variants} variants · {status === 'active' ? 'Active' : status}
                      </>
                    ) : (
                      <>
                        {formatMoney(Number(product.base_price), currency)} ·{' '}
                        {status === 'active' ? 'Active' : status}
                        {stockLabel ? (
                          <Text className={stockLabelToneClass(stockLabel.tone)}>
                            {` · ${stockLabel.text}`}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </Text>
                </View>
              </Pressable>
            )
          })}
          {filtered.length === 0 ? (
            <Text className="text-center text-gray-500 py-8">No products found</Text>
          ) : null}
        </View>
      )}
    </SleekModal>
  )
}

const styles = StyleSheet.create({
  thumb: { width: 48, height: 48 },
})
