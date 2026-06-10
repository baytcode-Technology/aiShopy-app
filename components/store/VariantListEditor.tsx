import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { VariantImageTile } from '@/components/store/VariantImageTile'
import { ProductStatusBadge } from '@/components/store/ProductStatusBadge'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
  compareAtPrice: string
  stockQty: string
  sku: string
  isActive: boolean
  imageUrl?: string | null
  imageUri?: string | null
  imageName?: string
  imageType?: string
  imageRemoved?: boolean
}

export function variantsToEditable(rows: ProductVariant[]): EditableVariantRow[] {
  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    priceDelta: String(v.price_delta),
    compareAtPrice: v.compare_at_price != null ? String(v.compare_at_price) : '',
    stockQty: String(v.stock_qty),
    sku: v.sku ?? '',
    isActive: v.is_active,
    imageUrl: v.image_url,
    imageUri: null,
    imageRemoved: false,
  }))
}

const fieldInputClass = 'border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-ink bg-gray-100'

type Props = {
  productId: string
  variants: EditableVariantRow[]
  onChange: (variants: EditableVariantRow[]) => void
}

export function VariantListEditor({ productId, variants, onChange }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const update = (id: string, patch: Partial<EditableVariantRow>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const runDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteProductVariant(productId, deleteTarget.id)
      onChange(variants.filter((v) => v.id !== deleteTarget.id))
      setDeleteTarget(null)
      showSuccess('Variant deleted')
    } catch (e) {
      showError(e, 'Could not delete variant')
    } finally {
      setDeleteLoading(false)
    }
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
      {variants.map((v) => {
        const status = v.isActive ? 'active' : 'unlisted'
        const displayImageUri = v.imageRemoved ? null : (v.imageUri ?? v.imageUrl)
        return (
          <Card key={v.id} className="border-ink gap-2">
            <View className="flex-row items-start gap-2.5">
              <VariantImageTile
                imageUri={displayImageUri}
                size={40}
                onPick={(file) =>
                  update(v.id, {
                    imageUri: file.uri,
                    imageName: file.name,
                    imageType: file.type,
                    imageRemoved: false,
                  })
                }
                onRemove={
                  displayImageUri
                    ? () =>
                        update(v.id, {
                          imageUri: null,
                          imageName: undefined,
                          imageType: undefined,
                          imageRemoved: true,
                        })
                    : undefined
                }
              />
              <View className="flex-1 flex-row items-center justify-between min-w-0">
              <Text
                className="text-sm font-bold text-ink flex-1 mr-2 pt-0.5"
                numberOfLines={1}
              >
                {v.name || 'Unnamed variant'}
              </Text>
              <View className="flex-row items-center gap-1.5 shrink-0">
                <ProductStatusBadge status={status} />
                <IconButton
                  size="sm"
                  onPress={() => update(v.id, { isActive: !v.isActive })}
                  accessibilityLabel={v.isActive ? 'Mark variant unlisted' : 'Mark variant active'}
                >
                  <FontAwesome
                    name={v.isActive ? 'toggle-on' : 'toggle-off'}
                    size={20}
                    color={v.isActive ? Colors.brand.primary : Colors.text.muted}
                  />
                </IconButton>
                <IconButton
                  size="sm"
                  onPress={() => setDeleteTarget({ id: v.id, name: v.name || 'Unnamed variant' })}
                  accessibilityLabel="Delete variant"
                >
                  <FontAwesome name="trash-o" size={14} color="#EF4444" />
                </IconButton>
              </View>
              </View>
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
                <Label className="mb-1 normal-case tracking-normal text-[10px]">Compare at</Label>
                <TextInput
                  className={fieldInputClass}
                  value={v.compareAtPrice}
                  onChangeText={(compareAtPrice) => update(v.id, { compareAtPrice })}
                  keyboardType="decimal-pad"
                  placeholder="Optional"
                  placeholderTextColor={Colors.text.muted}
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
        )
      })}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete variant"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.name}" from this product? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        onConfirm={runDelete}
      />
    </View>
  )
}
