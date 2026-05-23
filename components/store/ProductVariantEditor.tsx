import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthInput } from '@/components/auth/AuthInput'
import { SectionTitle } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'

export type VariantDraft = {
  id: string
  name: string
  priceDelta: string
  stockQty: string
  sku: string
}

type Props = {
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
}

export function ProductVariantEditor({ variants, onChange }: Props) {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        id: `${Date.now()}`,
        name: '',
        priceDelta: '0',
        stockQty: '0',
        sku: '',
      },
    ])
  }

  const update = (id: string, patch: Partial<VariantDraft>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const remove = (id: string) => {
    onChange(variants.filter((v) => v.id !== id))
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <SectionTitle>Variants (optional)</SectionTitle>
        <Pressable
          onPress={addVariant}
          className="flex-row items-center gap-1 border border-ink px-2 py-1 rounded-md"
        >
          <FontAwesome name="plus" size={12} color={Colors.brand.primary} />
          <Text className="text-xs font-semibold text-ink">Add variant</Text>
        </Pressable>
      </View>
      <Text className="text-xs text-gray-600">
        Use variants for size, color, etc. Each has its own stock.
      </Text>
      {variants.map((v, index) => (
        <View
          key={v.id}
          className="border border-gray-200 rounded-xl p-2.5 gap-1 bg-gray-100"
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-[13px] font-bold text-ink">Variant {index + 1}</Text>
            <Pressable onPress={() => remove(v.id)} hitSlop={8}>
              <FontAwesome name="trash-o" size={16} color={Colors.text.secondary} />
            </Pressable>
          </View>
          <AuthInput
            label="Name *"
            value={v.name}
            onChangeText={(name) => update(v.id, { name })}
            placeholder="Large / Red"
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AuthInput
                label="Price +/−"
                value={v.priceDelta}
                onChangeText={(priceDelta) => update(v.id, { priceDelta })}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <AuthInput
                label="Stock"
                value={v.stockQty}
                onChangeText={(stockQty) => update(v.id, { stockQty })}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <AuthInput
            label="SKU"
            value={v.sku}
            onChangeText={(sku) => update(v.id, { sku })}
            placeholder="VAR-001"
            autoCapitalize="none"
          />
        </View>
      ))}
    </View>
  )
}
