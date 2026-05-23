import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Caption, Label, SectionTitle } from '@/components/ui/Typography'
import { deleteProductVariant } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { ProductVariant } from '@src/types/product'

export type EditableVariantRow = {
  id: string
  name: string
  priceDelta: string
  stockQty: string
  sku: string
}

export function variantsToEditable(rows: ProductVariant[]): EditableVariantRow[] {
  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    priceDelta: String(v.price_delta),
    stockQty: String(v.stock_qty),
    sku: v.sku ?? '',
  }))
}

const fieldInputClass = 'border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-ink bg-gray-100'

type Props = {
  productId: string
  variants: EditableVariantRow[]
  onChange: (variants: EditableVariantRow[]) => void
}

export function VariantListEditor({ productId, variants, onChange }: Props) {
  const update = (id: string, patch: Partial<EditableVariantRow>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete variant', `Remove "${name}" from this product?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProductVariant(productId, id)
            onChange(variants.filter((v) => v.id !== id))
            showSuccess('Variant deleted')
          } catch (e) {
            showError(e)
          }
        },
      },
    ])
  }

  if (variants.length === 0) {
    return (
      <View className="p-3.5 border border-gray-200 rounded-[10px] bg-gray-100">
        <Caption>No variants yet. Add options below.</Caption>
      </View>
    )
  }

  return (
    <View className="gap-2.5">
      <SectionTitle>Existing variants</SectionTitle>
      {variants.map((v) => (
        <Card key={v.id} className="border-ink gap-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-ink flex-1 mr-2" numberOfLines={1}>
              {v.name || 'Unnamed variant'}
            </Text>
            <IconButton size="sm" onPress={() => confirmDelete(v.id, v.name)}>
              <FontAwesome name="trash-o" size={16} color={Colors.text.secondary} />
            </IconButton>
          </View>
          <TextInput
            className={fieldInputClass}
            value={v.name}
            onChangeText={(name) => update(v.id, { name })}
            placeholder="Variant name"
            placeholderTextColor={Colors.text.muted}
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Label className="mb-1 normal-case tracking-normal text-[10px]">Price +/−</Label>
              <TextInput
                className={fieldInputClass}
                value={v.priceDelta}
                onChangeText={(priceDelta) => update(v.id, { priceDelta })}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Label className="mb-1 normal-case tracking-normal text-[10px]">Stock</Label>
              <TextInput
                className={fieldInputClass}
                value={v.stockQty}
                onChangeText={(stockQty) => update(v.id, { stockQty })}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View>
            <Label className="mb-1 normal-case tracking-normal text-[10px]">SKU</Label>
            <TextInput
              className={fieldInputClass}
              value={v.sku}
              onChangeText={(sku) => update(v.id, { sku })}
              autoCapitalize="none"
            />
          </View>
        </Card>
      ))}
    </View>
  )
}
