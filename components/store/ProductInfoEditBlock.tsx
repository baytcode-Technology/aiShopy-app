import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { PriceDisplayRow } from '@/components/store/PriceDisplayRow'
import { ProductInfoEditModal } from '@/components/store/ProductInfoEditModal'
import { Caption, SectionTitle } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

type Props = {
  product: Product
  variantCount: number
  currencySymbol: string
  onUpdated: (product: Product) => void
}

export function ProductInfoEditBlock({
  product,
  variantCount,
  currencySymbol,
  onUpdated,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const stockDisplay = product.track_inventory
    ? String(product.stock_qty)
    : '—'

  return (
    <>
      <View className="mb-7 rounded-[20px] border border-gray-200 bg-surface p-4 relative">
        <Pressable
          onPress={() => setEditOpen(true)}
          className="absolute top-3 right-3 z-10"
          hitSlop={8}
          accessibilityLabel="Edit product details"
        >
          <View className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
            <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
          </View>
        </Pressable>

        <View className="pr-10">
          <Text className="text-[20px] font-extrabold text-ink tracking-tighter leading-tight mb-1">
            {product.name}
          </Text>
          <PriceDisplayRow
            currencySymbol={currencySymbol}
            price={product.base_price}
            compareAtPrice={product.compare_at_price}
            size="lg"
            className="mb-4"
          />

          <View className="flex-row gap-3 mb-4">
            <InfoStat label="Stock" value={stockDisplay} />
            <InfoStat label="SKU" value={product.sku ?? '—'} />
            <InfoStat label="Variants" value={String(variantCount)} />
          </View>

          <SectionTitle className="mb-2">About</SectionTitle>
          {product.description ? (
            <Text className="text-[15px] text-gray-600 leading-6">
              {product.description}
            </Text>
          ) : (
            <Text className="text-[15px] text-gray-400">No description</Text>
          )}
        </View>
      </View>

      <ProductInfoEditModal
        visible={editOpen}
        product={product}
        variantCount={variantCount}
        currencySymbol={currencySymbol}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  )
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[16px] p-3 bg-gray-50 border border-gray-100">
      <Caption className="uppercase tracking-widest mb-1 text-gray-400 text-[10px]">
        {label}
      </Caption>
      <Text className="text-base font-extrabold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
