import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { VariantEditableCard } from '@/components/store/VariantEditableCard'
import { Muted, SectionTitle } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { Product, ProductVariant } from '@src/types/product'

type Props = {
  product: Product
  variants: ProductVariant[]
  currencySymbol: string
  onVariantUpdated: (variant: ProductVariant) => void
  onVariantDeleted: (variantId: string) => void
}

export function ProductVariantsSection({
  product,
  variants,
  currencySymbol,
  onVariantUpdated,
  onVariantDeleted,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  if (variants.length === 0) {
    return (
      <View className="mb-8">
        <SectionTitle className="mb-3">Variants</SectionTitle>
        <Muted>No variants — single SKU product.</Muted>
      </View>
    )
  }

  return (
    <View className="mb-8 -mx-5">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between px-5 py-3.5 bg-gray-50 border-y border-gray-100 active:bg-gray-100"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <SectionTitle className="mb-0">Variants · {variants.length}</SectionTitle>
        <FontAwesome
          name={expanded ? 'chevron-down' : 'chevron-right'}
          size={14}
          color={Colors.brand.primary}
        />
      </Pressable>

      {expanded ? (
        <View className="mt-2 px-5">
          {variants.map((v) => (
            <VariantEditableCard
              key={v.id}
              variant={v}
              product={product}
              currencySymbol={currencySymbol}
              onUpdated={onVariantUpdated}
              onDeleted={onVariantDeleted}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}
