import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'
import { updateProductVariant } from '@src/api/products'
import { showError, showSuccess } from '@src/lib/toast'
import type { Product, ProductVariant } from '@src/types/product'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  variant: ProductVariant | null
  product: Product
  currencySymbol: string
  onClose: () => void
  onUpdated: (variant: ProductVariant) => void
}

export function VariantEditModal({
  visible,
  variant,
  product,
  currencySymbol,
  onClose,
  onUpdated,
}: Props) {
  const [priceDraft, setPriceDraft] = useState('')
  const [stockDraft, setStockDraft] = useState('')
  const [skuDraft, setSkuDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const unitPrice = variant
    ? Number(product.base_price) + Number(variant.price_delta)
    : 0

  useEffect(() => {
    if (!visible || !variant) return
    setPriceDraft(String(unitPrice))
    setStockDraft(String(variant.stock_qty))
    setSkuDraft(variant.sku ?? '')
  }, [visible, variant?.id, unitPrice, variant?.stock_qty, variant?.sku])

  const handleClose = () => {
    if (!saving) onClose()
  }

  const save = async () => {
    if (!variant) return
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
        sku: skuDraft.trim() || null,
      })
      onUpdated(res.data.variant)
      showSuccess('Variant updated')
      onClose()
    } catch (e) {
      showError(e, 'Could not update variant')
    } finally {
      setSaving(false)
    }
  }

  if (!variant) return null

  return (
    <SleekModal
      isOpen={visible}
      onClose={handleClose}
      title="Edit variant"
      subtitle={variant.name}
      footer={
        saving ? (
          <View className="py-4 items-center">
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : (
          <Button label="Save" onPress={save} />
        )
      }
    >
      <Field label="Price">
        <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
          <Text className="text-base font-bold text-ink mr-1">{currencySymbol}</Text>
          <TextInput
            className="flex-1 py-3 text-base font-bold text-ink"
            value={priceDraft}
            onChangeText={setPriceDraft}
            keyboardType="decimal-pad"
            selectionColor={Colors.brand.primary}
            editable={!saving}
          />
        </View>
      </Field>
      <Field label="Stock">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
          value={stockDraft}
          onChangeText={setStockDraft}
          keyboardType="number-pad"
          selectionColor={Colors.brand.primary}
          editable={!saving}
        />
      </Field>
      <Field label="SKU">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
          value={skuDraft}
          onChangeText={setSkuDraft}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Optional"
          placeholderTextColor={Colors.text.muted}
          selectionColor={Colors.brand.primary}
          editable={!saving}
        />
      </Field>
    </SleekModal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
      {children}
    </View>
  )
}
