import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { PriceDisplayRow } from '@/components/store/PriceDisplayRow'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { ProductInfoEditModal } from '@/components/store/ProductInfoEditModal'
import { Caption } from '@/components/ui/Typography'
import { getProductStockDisplayValue } from '@src/lib/product-inventory'
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

  const stockDisplay = getProductStockDisplayValue(product)

  return (
    <>
      <DetailSection className="p-3.5 relative">
        <Pressable
          onPress={() => setEditOpen(true)}
          className="absolute top-2.5 right-2.5 z-10"
          hitSlop={8}
          accessibilityLabel="Edit product details"
        >
          <View className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 items-center justify-center">
            <FontAwesome name="pencil" size={12} color={Colors.brand.primary} />
          </View>
        </Pressable>

        <View className="pr-9">
          <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
            Product details
          </Text>
          <Text
            className="text-[17px] font-extrabold text-ink tracking-tight leading-tight mb-1"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <PriceDisplayRow
            currencySymbol={currencySymbol}
            price={product.base_price}
            compareAtPrice={product.compare_at_price}
            size="md"
            className="mb-2.5"
          />

          <View className="flex-row gap-2 mb-2.5">
            <InfoStat label="Stock" value={stockDisplay} />
            <InfoStat label="SKU" value={product.sku ?? '—'} />
            <InfoStat label="Variants" value={String(variantCount)} />
          </View>

          {product.description ? (
            <Text className="text-[13px] text-gray-600 leading-5" numberOfLines={3}>
              {product.description}
            </Text>
          ) : (
            <Text className="text-[13px] text-gray-400">No description</Text>
          )}
        </View>
      </DetailSection>

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
    <View className="flex-1 rounded-xl p-2 bg-gray-50 border border-gray-200">
      <Caption className="uppercase tracking-widest mb-0.5 text-gray-400 text-[9px]">
        {label}
      </Caption>
      <Text className="text-[13px] font-extrabold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
