import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import {
  VariantImageTile,
  type PickedVariantImage,
} from '@/components/store/VariantImageTile'
import { VariantInventoryFlagsEditor } from '@/components/store/VariantInventoryFlagsEditor'
import { SleekModal } from '@/components/ui/Modal'
import { updateProductVariant } from '@src/api/products'
import { uploadProductImages } from '@src/api/uploads'
import { parseOptionalPrice } from '@src/lib/parse-optional-price'
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
  const [compareAtPriceDraft, setCompareAtPriceDraft] = useState('')
  const [stockDraft, setStockDraft] = useState('')
  const [skuDraft, setSkuDraft] = useState('')
  const [markAsSold, setMarkAsSold] = useState(false)
  const [markAsNonInventory, setMarkAsNonInventory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [displayImageUri, setDisplayImageUri] = useState<string | null>(null)
  const [pickedImage, setPickedImage] = useState<PickedVariantImage | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)

  const unitPrice = variant
    ? Number(product.base_price) + Number(variant.price_delta)
    : 0

  useEffect(() => {
    if (!visible || !variant) return
    setPriceDraft(String(unitPrice))
    setCompareAtPriceDraft(
      variant.compare_at_price != null ? String(variant.compare_at_price) : ''
    )
    setStockDraft(String(variant.stock_qty))
    setSkuDraft(variant.sku ?? '')
    setMarkAsSold(variant.mark_as_sold ?? false)
    setMarkAsNonInventory(variant.mark_as_non_inventory ?? false)
    setDisplayImageUri(variant.image_url)
    setPickedImage(null)
    setImageRemoved(false)
  }, [
    visible,
    variant?.id,
    unitPrice,
    variant?.compare_at_price,
    variant?.stock_qty,
    variant?.sku,
    variant?.mark_as_sold,
    variant?.mark_as_non_inventory,
    variant?.image_url,
  ])

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
    if (!Number.isFinite(stock) || !Number.isInteger(stock)) {
      showError('Enter a valid stock quantity')
      return
    }

    const compareAtPrice = parseOptionalPrice(compareAtPriceDraft)
    if (compareAtPrice === undefined) {
      showError('Enter a valid compare at price')
      return
    }

    const price_delta = price - Number(product.base_price)
    setSaving(true)
    try {
      let image_url: string | null | undefined
      if (imageRemoved) {
        image_url = null
      } else if (pickedImage) {
        const urls = await uploadProductImages(product.store_id, [pickedImage])
        image_url = urls[0] ?? null
        if (!image_url) throw new Error('Image upload failed')
      }

      const res = await updateProductVariant(product.id, variant.id, {
        price_delta,
        compare_at_price: compareAtPrice,
        stock_qty: stock,
        sku: skuDraft.trim() || null,
        ...(image_url !== undefined ? { image_url } : {}),
        mark_as_sold: markAsSold,
        mark_as_non_inventory: markAsNonInventory,
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
      <Field label="Variant image">
        <VariantImageTile
          imageUri={pickedImage?.uri ?? displayImageUri}
          size={56}
          disabled={saving}
          onPick={(file) => {
            setPickedImage(file)
            setImageRemoved(false)
          }}
          onRemove={
            pickedImage || displayImageUri
              ? () => {
                  setPickedImage(null)
                  setDisplayImageUri(null)
                  setImageRemoved(true)
                }
              : undefined
          }
        />
      </Field>

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
      <Field label="Compare at price">
        <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
          <Text className="text-base font-bold text-ink mr-1">{currencySymbol}</Text>
          <TextInput
            className="flex-1 py-3 text-base font-bold text-ink"
            value={compareAtPriceDraft}
            onChangeText={setCompareAtPriceDraft}
            keyboardType="decimal-pad"
            placeholder="Optional original price"
            placeholderTextColor={Colors.text.muted}
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

      <Field label="Variant inventory">
        <VariantInventoryFlagsEditor
          markAsSold={markAsSold}
          markAsNonInventory={markAsNonInventory}
          onMarkAsSoldChange={setMarkAsSold}
          onMarkAsNonInventoryChange={setMarkAsNonInventory}
          disabled={saving}
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
