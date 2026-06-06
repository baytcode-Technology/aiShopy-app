import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { SleekModal } from '@/components/ui/Modal'
import { updateProduct } from '@src/api/products'
import { parseOptionalPrice } from '@src/lib/parse-optional-price'
import { showError, showSuccess } from '@src/lib/toast'
import Colors from '@src/theme/colors'
import type { Product } from '@src/types/product'

type Props = {
  visible: boolean
  product: Product
  variantCount: number
  currencySymbol: string
  onClose: () => void
  onUpdated: (product: Product) => void
}

export function ProductInfoEditModal({
  visible,
  product,
  variantCount,
  currencySymbol,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(String(product.base_price))
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compare_at_price != null ? String(product.compare_at_price) : ''
  )
  const [stock, setStock] = useState(String(product.stock_qty))
  const [sku, setSku] = useState(product.sku ?? '')
  const [description, setDescription] = useState(product.description ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!visible) return
    setName(product.name)
    setPrice(String(product.base_price))
    setCompareAtPrice(
      product.compare_at_price != null ? String(product.compare_at_price) : ''
    )
    setStock(String(product.stock_qty))
    setSku(product.sku ?? '')
    setDescription(product.description ?? '')
  }, [
    visible,
    product.id,
    product.name,
    product.base_price,
    product.compare_at_price,
    product.stock_qty,
    product.sku,
    product.description,
  ])

  const handleClose = () => {
    if (!saving) onClose()
  }

  const save = async () => {
    const trimmedName = name.trim()
    const priceNum = Number(price)
    const stockNum = Number(stock)

    if (!trimmedName) {
      showError('Product name is required')
      return
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      showError('Enter a valid price')
      return
    }
    const compareNum = parseOptionalPrice(compareAtPrice)
    if (compareNum === undefined) {
      showError('Enter a valid compare at price')
      return
    }
    if (
      !Number.isFinite(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(stockNum)
    ) {
      showError('Enter a valid stock quantity')
      return
    }

    setSaving(true)
    try {
      const res = await updateProduct(product.id, {
        name: trimmedName,
        base_price: priceNum,
        compare_at_price: compareNum,
        stock_qty: stockNum,
        track_inventory: true,
        sku: sku.trim() || null,
        description: description.trim() || null,
      })
      onUpdated(res.data)
      showSuccess('Product updated')
      onClose()
    } catch (e) {
      showError(e, 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SleekModal
      isOpen={visible}
      onClose={handleClose}
      title="Edit product"
      subtitle={product.name}
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
      <Field label="Product name">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-lg font-bold text-ink"
          value={name}
          onChangeText={setName}
          selectionColor={Colors.brand.primary}
          editable={!saving}
        />
      </Field>
      <Field label="Price">
        <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
          <Text className="text-base font-bold text-ink mr-1">{currencySymbol}</Text>
          <TextInput
            className="flex-1 py-3 text-base font-bold text-ink"
            value={price}
            onChangeText={setPrice}
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
            value={compareAtPrice}
            onChangeText={setCompareAtPrice}
            keyboardType="decimal-pad"
            placeholder="Optional original price"
            placeholderTextColor={Colors.text.muted}
            selectionColor={Colors.brand.primary}
            editable={!saving}
          />
        </View>
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Stock">
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              selectionColor={Colors.brand.primary}
              editable={!saving}
            />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="SKU">
            <TextInput
              className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-ink"
              value={sku}
              onChangeText={setSku}
              autoCapitalize="none"
              selectionColor={Colors.brand.primary}
              editable={!saving}
            />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="Variants">
            <View className="border border-gray-200 rounded-xl bg-gray-100 px-3 py-3">
              <Text className="text-base font-extrabold text-ink text-center">
                {variantCount}
              </Text>
            </View>
          </Field>
        </View>
      </View>
      <Field label="Description">
        <TextInput
          className="border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 text-[15px] text-ink min-h-[88px]"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          selectionColor={Colors.brand.primary}
          placeholder="Add a description…"
          placeholderTextColor={Colors.text.muted}
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
