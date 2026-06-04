import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Card } from '@/components/ui/Card'
import { CancelSaveRow } from '@/components/ui/CancelSaveRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Caption } from '@/components/ui/Typography'
import { ProductStatusBadge } from '@/components/store/ProductStatusBadge'
import { deleteProductVariant, updateProductVariant } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product, ProductVariant } from '@src/types/product'
import Colors from '@src/theme/colors'

type Props = {
  variant: ProductVariant
  product: Product
  currencySymbol: string
  onUpdated: (variant: ProductVariant) => void
  onDeleted?: (variantId: string) => void
}

export function VariantEditableCard({
  variant,
  product,
  currencySymbol,
  onUpdated,
  onDeleted,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [priceDraft, setPriceDraft] = useState('')
  const [stockDraft, setStockDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const displayActive = optimisticActive ?? variant.is_active
  const status = displayActive ? 'active' : 'unlisted'
  const cardLocked = busy || deleteLoading

  const unitPrice = Number(product.base_price) + Number(variant.price_delta)
  const optionLabels = Object.entries(variant.options ?? {})
    .map(([k, val]) => `${k}: ${val}`)
    .join(' · ')

  useEffect(() => {
    setPriceDraft(String(unitPrice))
    setStockDraft(String(variant.stock_qty))
  }, [variant.id, unitPrice, variant.stock_qty])

  const cancel = () => {
    setPriceDraft(String(unitPrice))
    setStockDraft(String(variant.stock_qty))
    setExpanded(false)
  }

  const save = async () => {
    const price = Number(priceDraft)
    const stock = Number(stockDraft)
    if (!Number.isFinite(price) || price < 0) {
      showError('Enter a valid price')
      return
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      showError('Enter a valid stock quantity')
      return
    }

    const price_delta = price - Number(product.base_price)
    setSaving(true)
    try {
      const res = await updateProductVariant(product.id, variant.id, {
        price_delta,
        stock_qty: stock,
      })
      onUpdated(res.data.variant)
      setExpanded(false)
      showSuccess('Variant updated')
    } catch (e) {
      showError(e, 'Could not update variant')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async () => {
    if (cardLocked || expanded) return
    const next = !variant.is_active
    setBusy(true)
    setOptimisticActive(next)
    try {
      const res = await updateProductVariant(product.id, variant.id, { is_active: next })
      onUpdated(res.data.variant)
      showSuccess(next ? 'Variant is active' : 'Variant is unlisted')
    } catch (e) {
      setOptimisticActive(null)
      showError(e, 'Could not update variant status')
    } finally {
      setOptimisticActive(null)
      setBusy(false)
    }
  }

  const runDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteProductVariant(product.id, variant.id)
      setDeleteOpen(false)
      onDeleted?.(variant.id)
      showSuccess('Variant deleted')
    } catch (e) {
      showError(e, 'Could not delete variant')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card className="relative mb-3 p-4 overflow-hidden">
        {busy ? (
          <View
            className="absolute inset-0 z-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.62)' }}
            pointerEvents="auto"
          >
            <ActivityIndicator size="small" color={Colors.brand.primary} />
          </View>
        ) : null}

        <View className="flex-row items-start mb-2">
          <Text className="flex-1 text-base font-extrabold text-ink pr-2">{variant.name}</Text>
          <View className="flex-row items-center gap-1.5 shrink-0">
            <ProductStatusBadge status={status} />
            <IconButton
              size="sm"
              onPress={toggleActive}
              disabled={cardLocked || expanded}
              accessibilityLabel={displayActive ? 'Disable variant' : 'Enable variant'}
            >
              <FontAwesome
                name={displayActive ? 'toggle-on' : 'toggle-off'}
                size={20}
                color={displayActive ? Colors.brand.primary : Colors.text.muted}
              />
            </IconButton>
          </View>
        </View>
        {optionLabels ? <Caption className="mb-3">{optionLabels}</Caption> : null}

        {!expanded ? (
          <View className="flex-row flex-wrap gap-3 pr-[4.75rem]">
            <Text className="text-[13px] font-bold text-ink">
              {currencySymbol}
              {unitPrice}
            </Text>
            <Text className="text-[13px] font-bold text-gray-600">Stock {variant.stock_qty}</Text>
            {variant.sku ? (
              <Text className="text-[13px] font-bold text-gray-600">SKU {variant.sku}</Text>
            ) : null}
          </View>
        ) : (
          <View className="mt-1 pt-3 border-t border-gray-100 gap-3">
            <View>
              <Text className="text-[12px] font-bold text-gray-500 mb-1.5">Price</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                <Text className="text-base font-bold text-ink mr-1">{currencySymbol}</Text>
                <TextInput
                  className="flex-1 py-3 text-base font-bold text-ink"
                  value={priceDraft}
                  onChangeText={setPriceDraft}
                  keyboardType="decimal-pad"
                  selectionColor={Colors.brand.primary}
                  editable={!cardLocked}
                />
              </View>
            </View>
            <View>
              <Text className="text-[12px] font-bold text-gray-500 mb-1.5">Stock</Text>
              <TextInput
                className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
                value={stockDraft}
                onChangeText={setStockDraft}
                keyboardType="number-pad"
                selectionColor={Colors.brand.primary}
                editable={!cardLocked}
              />
            </View>
            <CancelSaveRow onCancel={cancel} onSave={save} saving={saving} />
          </View>
        )}

        {!expanded ? (
          <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
            <IconButton
              size="sm"
              onPress={() => setExpanded(true)}
              disabled={cardLocked}
              accessibilityLabel="Edit variant"
            >
              <FontAwesome name="pencil" size={14} color={Colors.brand.primary} />
            </IconButton>
            <IconButton
              size="sm"
              onPress={() => setDeleteOpen(true)}
              disabled={cardLocked}
              accessibilityLabel="Delete variant"
            >
              <FontAwesome name="trash-o" size={14} color="#EF4444" />
            </IconButton>
          </View>
        ) : null}
      </Card>

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete variant"
        message={`Remove "${variant.name}" from this product? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteOpen(false)
        }}
        onConfirm={runDelete}
      />
    </>
  )
}
