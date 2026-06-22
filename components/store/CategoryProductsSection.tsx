import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ProductListRow } from '@/components/store/ProductListRow'
import { Muted, SectionTitle } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

type Props = {
  products: Product[]
  onPressProduct: (productId: number) => void
  onAddRemove: () => void
}

export function CategoryProductsSection({
  products,
  onPressProduct,
  onAddRemove,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <View className="mb-8 -mx-5">
      <View className="flex-row items-center bg-gray-50 border-y border-gray-100">
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          className="flex-1 flex-row items-center justify-between px-5 py-3.5 active:bg-gray-100"
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <SectionTitle className="mb-0">Products · {products.length}</SectionTitle>
          <FontAwesome
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={14}
            color={Colors.brand.primary}
          />
        </Pressable>
        <Pressable
          onPress={onAddRemove}
          className="flex-row items-center gap-1.5 px-4 py-3.5 border-l border-gray-100 active:bg-gray-100"
          hitSlop={4}
        >
          <FontAwesome name="exchange" size={12} color={Colors.brand.primary} />
          <Text className="text-[12px] font-bold text-ink">Add / remove</Text>
        </Pressable>
      </View>

      {expanded ? (
        <View className="mt-0 px-5">
          {products.length === 0 ? (
            <Muted className="text-center py-6 text-[15px]">
              No products in this category. Use Add / remove or tap + below.
            </Muted>
          ) : (
            products.map((item) => (
              <ProductListRow
                key={item.id}
                product={item}
                onPress={() => onPressProduct(item.id)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  )
}
